import hashlib
import hmac
import secrets
import requests
from urllib.parse import urlencode
from django.conf import settings


def get_auth_url(shop_domain, state):
    """
    Builds the URL we send the merchant to.
    They land on Shopify's own login/consent screen for THEIR store,
    review the requested scope (read_products), and click Allow.

    shop_domain: e.g. "my-store.myshopify.com" — the merchant's own store,
                 NOT your dev store. This is why the flow works for any merchant.
    state: a random, unpredictable string we generate and store temporarily
           (e.g. in the session or a short-lived DB row) BEFORE redirecting.
           Shopify sends it back unchanged in the callback. We compare it
           to what we stored — if it doesn't match, we reject the callback.
           This is what stops a malicious third party from forging a fake
           callback and tricking your server into linking their shop to
           someone else's merchant account (a CSRF attack on the OAuth flow).
    """
    params = {
        'client_id': settings.SHOPIFY_CLIENT_ID,
        'scope': settings.SHOPIFY_SCOPES,
        'redirect_uri': settings.SHOPIFY_REDIRECT_URI,
        'state': state,
    }
    return f"https://{shop_domain}/admin/oauth/authorize?{urlencode(params)}"


def exchange_code_for_token(shop_domain, code):
    """
    Called from the callback view, AFTER Shopify redirects the merchant back.
    Trades the short-lived `code` (valid only once, expires fast) for a
    real, long-lived access token we can use for actual API calls later.

    This is a server-to-server call — your Django backend talking directly
    to Shopify's servers, not something that happens in the merchant's browser.
    """
    url = f"https://{shop_domain}/admin/oauth/access_token"
    payload = {
        'client_id': settings.SHOPIFY_CLIENT_ID,
        'client_secret': settings.SHOPIFY_CLIENT_SECRET,
        'code': code,
    }
    response = requests.post(url, json=payload, timeout=10)
    response.raise_for_status()  # raises an exception on 4xx/5xx instead of failing silently

    data = response.json()
    return {
        'access_token': data['access_token'],
        'scope': data['scope'],
    }


def verify_hmac(query_params):
    """
    Shopify signs EVERY request it sends to your app (including the callback)
    with an HMAC signature, using your Client Secret as the key.

    Why this matters: the `state` check (above) proves the request came from
    a flow WE started. This HMAC check proves the request genuinely came from
    SHOPIFY and wasn't tampered with in transit or forged by someone who
    guessed/intercepted a valid-looking callback URL. Two different, both
    necessary, layers of trust.

    query_params: dict of the callback's query string (shop, code, state, hmac, etc.)
    """
    params = query_params.copy()
    received_hmac = params.pop('hmac', None)
    if not received_hmac:
        return False

    # Shopify's rule: sort remaining params alphabetically, join as key=value pairs
    sorted_params = '&'.join(
        f"{key}={value}" for key, value in sorted(params.items())
    )

    computed_hmac = hmac.new(
        settings.SHOPIFY_CLIENT_SECRET.encode('utf-8'),
        sorted_params.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    # constant-time comparison — prevents timing attacks that could
    # otherwise leak the correct hmac one character at a time
    return hmac.compare_digest(computed_hmac, received_hmac)


def generate_state(merchant_id):
    """
    Instead of storing state in a session (which needs cookies, which
    fights our JWT-only, stateless architecture), we encode the merchant_id
    directly INTO the state string itself, cryptographically signed.

    merchant_id is cast to str() because Merchant's primary key is a UUID,
    and Python's json module (used internally by django's signing) can't
    serialize UUID objects directly — only JSON-native types (str, int,
    float, bool, list, dict, None).

    django's signing.dumps() appends a signature Shopify can't forge or
    tamper with (it doesn't have your SECRET_KEY). When we get it back
    in the callback, signing.loads() both verifies the signature AND
    decodes the merchant_id in one step. No database or session needed —
    the state value carries its own proof of authenticity.
    """
    from django.core import signing
    return signing.dumps({'merchant_id': str(merchant_id)})


def verify_and_decode_state(state, max_age_seconds=600):
    """
    Reverses generate_state(). Raises BadSignature if tampered with,
    or SignatureExpired if the flow took longer than max_age_seconds
    (10 minutes — plenty of time for a merchant to review and click Allow).
    Returns the merchant_id if valid.
    """
    from django.core import signing
    data = signing.loads(state, max_age=max_age_seconds)
    return data['merchant_id']