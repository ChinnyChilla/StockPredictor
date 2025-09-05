import type { Metadata } from "next"
import ProjectCard from "@/components/portfolio/project-card"

export const metadata: Metadata = {
	title: "Michael's Projects",
	description: "A collection of projects by Michael Zheng.",
}

const allProjects = [
	{
		title: "Stock Earnings Dashboard",
		description: "A dashboard to track stock earnings and give insights on volatility during a company's earnings week",
		link: "/stock",
		skills: ["Next.js", "TypeScript", "Tailwind CSS", "React", "Node.js"],
	},
	{
		title: "Foodi",
		description: "Take a picture of your food and get nutritional information about it",
		link: "/projects/foodi",
		skills: [],
	}
]

export default function ProjectsPage() {
	return (
		<div className="flex flex-col gap-12 p-4 md:p-8">
			<section className="flex flex-col items-center gap-2 text-center mt-8">
				<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
					My Projects
				</h1>
			</section>

			<section>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{allProjects.map((project) => (
						<ProjectCard key={project.title} {...project} />
					))}
				</div>
			</section>
		</div>
	)
}
