import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

const footerLinks = {
  Product: ["Features", "Pricing", "Documentation"],
  Company: ["About", "Privacy Policy", "Terms", "Contact"],
  Resources: ["Blog", "Changelog", "Status", "Support"],
};

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                W
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Wiz AI
              </span>
            </div>

            <p className="mt-4 max-w-xs text-sm text-gray-500">
              AI customer support that knows your store.
            </p>

            <div className="mt-6 flex gap-4">
            <Mail size={18} className="text-gray-400 hover:text-blue-600" />
            <MessageCircle size={18} className="text-gray-400 hover:text-blue-600" />
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-sm font-semibold text-gray-900">{heading}</p>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-gray-500 hover:text-blue-600"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-8">
          <p className="text-sm text-gray-400">
            © 2026 Wiz AI. All rights reserved.
          </p>
          <p className="text-sm text-gray-400">SOC 2 Type II · GDPR compliant</p>
        </div>
      </div>
    </footer>
  );
}