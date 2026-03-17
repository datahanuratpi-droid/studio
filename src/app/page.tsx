
"use client"

import Link from 'next/link'
import { CheckCircle2, ArrowRight, Zap, Shield, Layout, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="#">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-2">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-headline font-bold text-primary">TaskFlow Pro</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-accent transition-colors" href="#">Features</Link>
          <Link className="text-sm font-medium hover:text-accent transition-colors" href="#">Pricing</Link>
          <Link href="/dashboard">
            <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white rounded-full">
              Login
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 px-4 flex flex-col items-center justify-center text-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="inline-block rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent border border-accent/20 mb-4 animate-in fade-in slide-in-from-bottom-2">
                New: AI-Powered Task breakdown is here!
              </div>
              <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-primary max-w-3xl">
                Manage Tasks with <span className="text-accent">Clarity</span> and AI Intelligence
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl font-body mt-4">
                TaskFlow Pro streamlines your workflow, allowing you to focus on what matters most. Organize, prioritize, and accelerate with the help of smart automation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link href="/dashboard">
                  <Button size="lg" className="rounded-full px-8 bg-primary text-white hover:bg-primary/90 h-12 text-md">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="rounded-full px-8 border-primary text-primary h-12 text-md">
                  View Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-3 md:grid-cols-2">
              <div className="flex flex-col items-start space-y-3 p-6 rounded-2xl bg-background border border-border/50 hover:shadow-xl transition-shadow">
                <div className="p-3 bg-accent/10 rounded-xl text-accent">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-headline font-bold text-primary">Intelligent Detailer</h3>
                <p className="text-muted-foreground">
                  Our GenAI tool suggests detailed descriptions and breaks down complex tasks into manageable sub-tasks instantly.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-3 p-6 rounded-2xl bg-background border border-border/50 hover:shadow-xl transition-shadow">
                <div className="p-3 bg-accent/10 rounded-xl text-accent">
                  <Layout className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-headline font-bold text-primary">Beautiful Dashboard</h3>
                <p className="text-muted-foreground">
                  A clean, professional interface designed for focus. View your entire project landscape at a glance.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-3 p-6 rounded-2xl bg-background border border-border/50 hover:shadow-xl transition-shadow">
                <div className="p-3 bg-accent/10 rounded-xl text-accent">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-headline font-bold text-primary">Rapid Management</h3>
                <p className="text-muted-foreground">
                  Quickly edit, complete, or re-prioritize tasks with smooth, reactive controls that keep up with your pace.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-white">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl mb-6">
              Ready to boost your productivity?
            </h2>
            <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl mb-10">
              Join thousands of professionals who have simplified their work life with TaskFlow Pro.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="rounded-full bg-accent text-white hover:bg-accent/90 h-12 px-10">
                Start your flow today
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© 2024 TaskFlow Pro Inc. All rights reserved.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4" href="#">Terms of Service</Link>
            <Link className="text-xs hover:underline underline-offset-4" href="#">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
