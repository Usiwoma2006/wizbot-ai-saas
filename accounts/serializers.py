from rest_framework import serializers
from .models import Merchant


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )
    shop_name = serializers.CharField(
        min_length=2,
        max_length=100
    )

    class Meta:
        model = Merchant
        fields = ['email', 'password', 'shop_name']

    def validate_email(self, value):
        normalized = value.lower().strip()
        if Merchant.objects.filter(email=normalized).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )
        return normalized

    def create(self, validated_data):
        email = validated_data['email']
        merchant = Merchant.objects.create_user(
            username=email,
            email=email,
            password=validated_data['password'],
            shop_name=validated_data['shop_name']
        )
        return merchant
    
class MerchantProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)
    embed_key = serializers.CharField(read_only=True)
    shop_name = serializers.CharField(min_length=2, max_length=100)
    # Website.status is pending/scraping/ready/failed — never literally
    # "connected". This translates the real status into what the dashboard
    # frontend already expects, so the frontend doesn't need to change.
    website_status = serializers.SerializerMethodField()
 
    class Meta:
        model = Merchant
        fields = [
            'email',
            'shop_name',
            'widget_color',
            'widget_name',
            'response_time_hours',
            'notification_email',
            'notify_on_escalation',
            'embed_key',
            'website_status',
            'widget_avatar_url'
        ]
 
    def get_website_status(self, obj):
        return 'connected' if obj.websites.filter(status='ready').exists() else 'not_connected'