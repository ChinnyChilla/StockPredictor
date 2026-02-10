import type { Metadata } from "next"
import Link from "next/link"
import { Github, Linkedin, Briefcase, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProjectCard from "@/components/portfolio/project-card"
import SkillIcon from "@/components/ui/skill-icons"

export const metadata: Metadata = {
	title: "Michael Zheng's Portfolio",
	description: "A showcase of Michael Zheng's projects and experiences .",
}

const experiences = [
	{
		type: "education",
		title: "B.S. in Computer Science",
		company: "Binghamton University",
		date: "Graduating December 2025",
		description: "",
		skills: [],
	},
	{
		type: "work",
		title: "Software Developer",
		company: "StockSurge Inc.",
		date: "August 2024 - May 2025",
		description: "A mobile trading application to provide users with real-time financial insights. The platform runs on a secure, high-performance backend built to process thousands of transactions with minimal latency.",
		skills: ["Swift", "Java", "PostgreSQL", "SpringBoot", "Git", "AWS"],
	},
	{
		type: "work",
		title: "Software Engineering Intern",
		company: "ContentStack Inc.",
		date: "June 2024 - August 2024",
		description: "Led a development team to build a full-stack dashboard designed to enhance employee cooperation and recognition. Guided the project from conception to completion, overseeing the creation of a responsive UI and an optimized database backend.",
		skills: ["React", "Python", "Git", "HTML", "CSS"],
	},
	{
		type: "work",
		title: "Full Stack Software Engineering Intern",
		company: "Odoo Inc.",
		date: "June 2023 - August 2023",
		description: "Developed a platform for internal feedback to enhance team collaboration and streamline project discussions. Worked with cross-functional teams to architect and deploy further modules for automating inventory and sales workflows.",
		skills: ["Python", "XML", "OOP", "Git", "Octoprint"],
	}
]

const projects = [
	{
		title: "Stock Market Dashboard",
		description: "A comprehensive dashboard for monitoring stock performance, news, and options chains in real-time.",
		link: "/stocks",
		skills: ["Next.js", "TypeScript", "Tailwind CSS", "React", "Node.js"],
	},
	{
		title: "Foodi",
		description: "Take a picture of your food and get nutritional information about it",
		link: "/projects/foodi",
		skills: [],
	}
]

export default function HomePage() {
	return (
		<div className="flex flex-col gap-24 p-4 md:p-8">
			{/* Hero Section */}
			<section className="flex flex-col items-center gap-4 text-center mt-8">
				<h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
					Michael Zheng
				</h1>
				<p className="max-w-2xl text-lg text-muted-foreground">
					Software Engineer
				</p>
				<div className="flex gap-4">
					<Link href="https://github.com/ChinnyChilla" target="_blank" rel="noopener noreferrer">
						<Button>
							<Github className="mr-2 h-4 w-4" /> GitHub
						</Button>
					</Link>
					<Link href="https://www.linkedin.com/in/michaelzheng04/" target="_blank" rel="noopener noreferrer">
						<Button variant="secondary">
							<Linkedin className="mr-2 h-4 w-4" /> LinkedIn
						</Button>
					</Link>
				</div>
			</section>

			{/* Experience Timeline Section */}
			<section>
				<h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
					My Experience
				</h2>
				<div className="relative mx-auto max-w-5xl">
					{/* The timeline line */}
					<div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-border"></div>

					{experiences.map((exp, index) => (
						<div key={index} className="relative mb-8 flex w-full items-center justify-between md:mb-16">
							{/* This empty div is a spacer */}
							<div className={`hidden md:block md:w-5/12 ${index % 2 === 0 ? "order-1" : "order-3"}`}></div>

							{/* The experience card */}
							<div className={`w-full rounded-lg border bg-card p-6 shadow-sm md:w-5/12 ${index % 2 === 0 ? "order-3" : "order-1"}`}>
								<p className="text-sm font-semibold text-primary">{exp.date}</p>
								<h3 className="text-xl font-bold">{exp.title}</h3>
								<p className="text-md font-medium text-muted-foreground">{exp.company}</p>
								<p className="mt-2 text-sm text-muted-foreground">{exp.description}</p>
								<div className={`mt-4 flex flex-wrap gap-2 ${index % 2 !== 0 ? "justify-end" : ""}`}>
									{exp.skills.map(skill => <SkillIcon key={skill} skill={skill} />)}
								</div>
							</div>

							{/* The timeline dot and icon */}
							<div className="hidden md:absolute md:left-1/2 md:top-1/2 md:z-10 md:flex md:h-10 md:w-10 md:-translate-x-1/2 md:-translate-y-1/2 md:items-center md:justify-center md:rounded-full md:border-2 md:border-primary md:bg-background md:order-2">
								{exp.type === 'work' ? <Briefcase className="h-5 w-5 text-primary" /> : <GraduationCap className="h-5 w-5 text-primary" />}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Projects Section */}
			<section>
				<h2 className="mb-6 text-center text-3xl font-bold tracking-tight">
					Featured Projects
				</h2>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{projects.map((project) => (
						<ProjectCard key={project.title} {...project} />
					))}
				</div>
			</section>
		</div>
	)
}
