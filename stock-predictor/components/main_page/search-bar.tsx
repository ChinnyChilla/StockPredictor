"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SearchBar() {
	const [ticker, setTicker] = useState("")
	const router = useRouter()

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		if (ticker.trim()) {
			router.push(`/stock/${ticker.trim().toUpperCase()}`)
		}
	}

	return (
		<form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
			<Input
				type="text"
				placeholder="Search ticker (e.g., AAPL)"
				value={ticker}
				onChange={(e) => setTicker(e.target.value)}
				className="flex-1"
			/>
			<Button type="submit" size="icon">
				<SearchIcon className="h-4 w-4" />
			</Button>
		</form>
	)
}