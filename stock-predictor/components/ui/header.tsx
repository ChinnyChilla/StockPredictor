"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export default function Header() {
	const pathname = usePathname()

	const navLinks = [
		{ href: "/", label: "Portfolio" },
		{ href: "/stock", label: "Stocks" },
		{ href: "/projects", label: "Projects" },
	]

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="relative flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

				<div className="flex">
					<Link href="/" className="text-lg font-bold tracking-tight">
						Michael's Website
					</Link>
				</div>

				<div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
					<nav className="flex items-center">
						{navLinks.map((link, index) => (
							<React.Fragment key={link.href}>
								<Link
									href={link.href}
									className={cn(
										"relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
										pathname === link.href
											? "text-primary"
											: "text-muted-foreground"
									)}
								>
									{link.label}
									{pathname === link.href && (
										<span className="absolute bottom-0 left-1/2 h-[2px] w-3/4 -translate-x-1/2 transform bg-primary"></span>
									)}
								</Link>
								{index < navLinks.length - 1 && (
									<div className="h-4 w-px bg-border" />
								)}
							</React.Fragment>
						))}
					</nav>
				</div>

				<div className="flex items-center md:hidden">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<Menu className="h-6 w-6" />
								<span className="sr-only">Toggle Menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{navLinks.map((link) => (
								<DropdownMenuItem key={link.href} asChild>
									<Link
										href={link.href}
										className={cn(
											"w-full justify-center",
											pathname === link.href && "font-bold text-primary"
										)}
									>
										{link.label}
									</Link>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	)
}
