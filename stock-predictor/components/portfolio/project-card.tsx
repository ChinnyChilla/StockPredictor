import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import SkillIcon from "@/components/ui/skill-icons"

interface ProjectCardProps {
	title: string
	description: string
	link: string
	skills: string[]
}

export default function ProjectCard({ title, description, link, skills }: ProjectCardProps) {
	return (
		<Card className="flex h-full flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
			<Link href={link} rel="noopener noreferrer">
			<CardHeader className="flex-grow">
				<div className="flex items-start justify-between">
					<CardTitle className="text-xl">{title}</CardTitle>
						<Button variant="ghost" size="icon">
							<ArrowUpRight className="h-5 w-5" />
						</Button>

				</div>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap gap-2">
					{skills.map((skill) => (
						<SkillIcon key={skill} skill={skill} />
					))}
				</div>
			</CardContent>
		</Link>
		</Card>
	)
}
