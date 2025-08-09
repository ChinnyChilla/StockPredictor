"use client"

import { useEffect, useRef, useState } from "react"

export function FlashingSpan({
	value,
	className = "",
}: {
	value: number | undefined
	className?: string
}) {
	const prevValue = useRef<number | null | undefined>(null)
	const [flashClass, setFlashClass] = useState("text-foreground")

	useEffect(() => {
		if (typeof value !== 'number') return;

		if (prevValue.current !== null && value !== prevValue.current) {
			const isUp = value > prevValue.current!
			setFlashClass(isUp ? "text-green-500" : "text-red-500")

			const timeout = setTimeout(() => {
				setFlashClass("text-foreground")
			}, 400)

			prevValue.current = value
			return () => clearTimeout(timeout)
		}
		prevValue.current = value
	}, [value])

	if (typeof value !== 'number') {
		return <span className={className}>-</span>;
	}

	return (
		<span className={`transition-colors duration-300 ${flashClass} ${className}`}>
			{value.toFixed(2)}
		</span>
	)
}

export default FlashingSpan
