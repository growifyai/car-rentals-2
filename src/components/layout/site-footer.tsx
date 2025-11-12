"use client";

export function SiteFooter() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex w-8 h-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <span className="text-white font-bold">Z</span>
              </div>
              <span className="font-bold">Zion Car Rentals</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium car rental service with luxury vehicles for every occasion.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <a href="/about" className="block text-muted-foreground transition-colors hover:text-primary">
                About Us
              </a>
              <a href="/cars" className="block text-muted-foreground transition-colors hover:text-primary">
                Our Fleet
              </a>
              <a href="/contact" className="block text-muted-foreground transition-colors hover:text-primary">
                Contact
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <div className="space-y-2 text-sm">
              <a href="/help/faq" className="block text-muted-foreground transition-colors hover:text-primary">
                FAQ
              </a>
              <a href="/legal/terms" className="block text-muted-foreground transition-colors hover:text-primary">
                Terms of Use
              </a>
              <a href="/legal/privacy" className="block text-muted-foreground transition-colors hover:text-primary">
                Privacy Policy
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Contact Info</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Phone: <a href="tel:9100664083" className="hover:text-primary">9100664083</a></p>
              <p>Email: <a href="mailto:Zioncarrentals90@gmail.com" className="hover:text-primary">Zioncarrentals90@gmail.com</a></p>
              <p>Address: 8,5,199 Mallika arjuna colony old bowenpally, Hyderabad - 500011, Telangana, India</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Zion Car Rentals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

