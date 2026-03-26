import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/ibbis-logo-bird.svg" alt="IBBIS" width={28} height={28} />
              <span className="font-bold">IBBIS Screen</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Accessible interface for IBBIS's open-source DNA/RNA biosecurity screening tools.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">Documentation</Link>
              </li>
              <li>
                <Link href="/api-docs" className="hover:text-primary transition-colors">API</Link>
              </li>
              <li>
                <Link href="https://ibbis.bio/" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">IBBIS Website</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="text-muted-foreground/60 cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="text-muted-foreground/60 cursor-default">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            This project is for demonstration purposes only. Created by Miguel Alvarado. All rights reserved. Unauthorized distribution or commercial use is prohibited. For licensing inquiries, contact the author.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
              Open Source
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
