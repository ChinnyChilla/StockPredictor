"use client"

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import React from "react"

import { FaPython, FaJs, FaReact, FaNodeJs, FaCss3, FaHtml5, FaGit, FaCode, FaSwift, FaJava, FaAws } from 'react-icons/fa6'
import { RiNextjsLine } from 'react-icons/ri'
import { SiTypescript, SiMysql, SiPostgresql, SiOctoprint, SiSpringboot } from 'react-icons/si'
import { TbFileTypeXml } from "react-icons/tb"

const iconMap: { [key: string]: React.ReactNode } = {
	"React": <FaReact />,
	"Next.js": <RiNextjsLine />,
	"TypeScript": <SiTypescript />,
	"JavaScript": <FaJs />,
	"Node.js": <FaNodeJs />,
	"XML": <TbFileTypeXml />,
	"Python": <FaPython />,
	"HTML": <FaHtml5 />,
	"CSS": <FaCss3 />,
	"SQL": <SiMysql />,
	"PostgreSQL": <SiPostgresql />,
	"Git": <FaGit />,
	"Octoprint": <SiOctoprint />,
	"Swift": <FaSwift />,
	"Java": <FaJava />,
	"SpringBoot": <SiSpringboot />,
	"AWS": <FaAws />,
	"Default": <FaCode />
};

interface SkillIconProps {
	skill: string
}

export default function SkillIcon({ skill }: SkillIconProps) {
	const icon = iconMap[skill] || iconMap["Default"];

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="rounded-full border bg-card p-2 transition-colors hover:bg-accent">
						{icon}
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<p>{skill}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}
