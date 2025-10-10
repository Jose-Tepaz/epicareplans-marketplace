import Link from "next/link"
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react"

export function Footer() {
  const footerLinks = {
    "Column One": [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Our Services", href: "/services" },
      { label: "FAQs", href: "/faqs" },
      { label: "Blog", href: "/blog" },
    ],
    "Column Two": [
      { label: "Insurance Types", href: "/insurance-types" },
      { label: "Claim Process", href: "/claim-process" },
      { label: "Customer Support", href: "/support" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Careers", href: "/careers" },
    ],
    "Column Three": [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Site Map", href: "/sitemap" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "Sitemap", href: "/sitemap" },
    ],
    "Column Four": [
      { label: "Link Sixteen", href: "#" },
      { label: "Link Seventeen", href: "#" },
      { label: "Link Eighteen", href: "#" },
      { label: "Link Nineteen", href: "#" },
      { label: "Link Twenty", href: "#" },
    ],
    "Column Five": [
      { label: "Link Twenty One", href: "#" },
      { label: "Link Twenty Two", href: "#" },
      { label: "Link Twenty Three", href: "#" },
      { label: "Link Twenty Four", href: "#" },
      { label: "Link Twenty Five", href: "#" },
    ],
  }

  return (
    <footer className="bg-muted pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Logo */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl font-bold">
              <span className="text-primary">épi</span>
              <span className="text-cyan">care</span>
            </span>
            <span className="text-xs text-gray-600">Plans</span>
          </Link>
        </div>

        {/* Footer links grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {Object.entries(footerLinks).map(([column, links]) => (
            <div key={column}>
              <h3 className="font-semibold text-gray-900 mb-4">{column}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-gray-700 hover:text-primary transition-colors text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-300 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-700">
            <span>© 2025 Relume. All rights reserved.</span>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">
              Cookies Settings
            </Link>
          </div>

          {/* Social media icons */}
          <div className="flex items-center gap-4">
            <Link href="#" className="text-gray-700 hover:text-primary transition-colors">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-700 hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-700 hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-700 hover:text-primary transition-colors">
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-gray-700 hover:text-primary transition-colors">
              <Youtube className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
