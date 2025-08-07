import { useEffect, useRef, useState } from "react"

export function FlashingSpan({
	value,
	className = "",
}: {
	value: number
	className?: string
}) {
	const prevValue = useRef<number | null>(null)
	const [flashClass, setFlashClass] = useState("text-foreground")

	useEffect(() => {
		if (prevValue.current !== null && value !== prevValue.current) {
			const isUp = value > prevValue.current
			setFlashClass(isUp ? "text-green-500" : "text-red-500")

			const timeout = setTimeout(() => {
				setFlashClass("text-foreground")
			}, 400)
			prevValue.current = value
			return () => clearTimeout(timeout)
		}
		prevValue.current = value
	}, [value])

	return (
		<span className={`transition-colors duration-300 ${flashClass} ${className}`}>
			${value.toFixed(2)}
		</span>
	)
}
export default FlashingSpan