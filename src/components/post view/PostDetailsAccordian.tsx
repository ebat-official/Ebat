import React, { FC } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Post, PostType } from "@prisma/client";
import { normalizeCompaniesData } from "@/hooks/useCompanyList";
import companiesData from "@/utils/companyListConfig";
import { AiOutlineTag } from "react-icons/ai";
import { IoPeopleOutline } from "react-icons/io5";
import { CiCircleList, CiViewList } from "react-icons/ci";

import { RiBuilding2Line } from "react-icons/ri";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import {
	PostWithExtraDetails,
	TableOfContent as TableOfContentType,
} from "@/utils/types";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { TableOfContent } from "@/components/post view/TableOfContent";
import { Card, CardContent } from "../ui/card";
import { FaListUl } from "react-icons/fa";

type PostDetailsAccordianProps = {
	post: PostWithExtraDetails;
};

const PostDetailsAccordian: FC<PostDetailsAccordianProps> = ({ post }) => {
	return (
		<Card>
			<CardContent>
				<Accordion
					className="w-full"
					defaultValue={["table-of-content", "companies"]}
					type="multiple"
				>
					{post.companies?.length > 0 && (
						<CompaniesAccordion companies={post.companies} />
					)}

					<TopicsAccordion topics={post.topics} />
					<CollaboratorsAccordion collaborators={post.collaborators} />
					{(post.type === PostType.BLOGS ||
						post.type === PostType.SYSTEMDESIGN) &&
						post.tableOfContent?.length && (
							<TableOfContentAccordion tableOfContent={post.tableOfContent} />
						)}
				</Accordion>
			</CardContent>
		</Card>
	);
};

// Topics Accordion
const TopicsAccordion: FC<{ topics: string[] }> = ({ topics }) => {
	return (
		<AccordionItem value="topics">
			<AccordionTrigger>
				<div className="flex gap-2 items-center">
					<AiOutlineTag className="" size={16} />
					<span>Topics</span>
				</div>
			</AccordionTrigger>
			<AccordionContent>
				<div className="flex flex-wrap gap-2">
					{topics.length > 0 ? (
						topics.map((topic, index) => (
							<Badge key={index} className="text-sm">
								{topic}
							</Badge>
						))
					) : (
						<p className="text-sm text-muted-foreground">
							No topics available.
						</p>
					)}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};

// Companies Accordion
const CompaniesAccordion: FC<{ companies: string[] }> = ({ companies }) => {
	const defaultLogo = <span className="default-logo">🏢</span>; // Replace with your default logo

	return (
		<AccordionItem value="companies">
			<AccordionTrigger>
				<div className="flex gap-2 items-center">
					<RiBuilding2Line size={16} />
					<span>Companies</span>
				</div>
			</AccordionTrigger>
			<AccordionContent>
				<div className="flex flex-wrap gap-2">
					{companies.length > 0 ? (
						companies.map((companyName, index) => {
							const matchedCompany = companiesData.find(
								(company) =>
									company.label.toLowerCase() === companyName.toLowerCase(),
							);

							return (
								<Badge key={index} className="text-sm flex items-center gap-2">
									{matchedCompany ? <matchedCompany.icon /> : defaultLogo}
									{companyName}
								</Badge>
							);
						})
					) : (
						<p className="text-sm text-muted-foreground">No data available.</p>
					)}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};

// Collaborators Accordion
const CollaboratorsAccordion: FC<{
	collaborators: {
		id: string;
		userName: string | null; // Allow userName to be null
		userProfile: { name?: string | null; image?: string | null } | null; // Adjust userProfile type
	}[];
}> = ({ collaborators }) => {
	return (
		<AccordionItem value="collaborators">
			<AccordionTrigger>
				<div className="flex gap-2 items-center">
					<IoPeopleOutline size={16} />
					<span>Collaborators</span>
				</div>
			</AccordionTrigger>
			<AccordionContent>
				<div className="flex flex-wrap gap-2">
					{collaborators?.length > 0 ? (
						collaborators.map((collaborator) => {
							const { userProfile, userName } = collaborator;
							const profileName =
								userProfile?.name?.split(" ")[0] || userName || "Unknown";
							const profileImage = userProfile?.image || undefined;

							return (
								<Badge
									variant="outline"
									key={collaborator.id}
									className="flex items-center gap-2 px-2 py-1"
								>
									<Avatar className="flex-shrink-0">
										<AvatarImage
											src={profileImage}
											alt="avatar"
											referrerPolicy="no-referrer"
										/>
										<AvatarFallback>
											{profileName.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<span className="text-sm capitalize font-medium">
										{profileName}
									</span>
								</Badge>
							);
						})
					) : (
						<p className="text-sm text-muted-foreground">
							No collaborators available.
						</p>
					)}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};

// Table of Content Accordion
const TableOfContentAccordion: FC<{
	tableOfContent: TableOfContentType | undefined;
}> = ({ tableOfContent }) => {
	return (
		<AccordionItem value="table-of-content">
			<AccordionTrigger>
				<div className="flex gap-2 items-center">
					<CiCircleList size={20} />

					<span>Table of Contents</span>
				</div>
			</AccordionTrigger>
			<AccordionContent>
				<TableOfContent tableOfContent={tableOfContent} />
			</AccordionContent>
		</AccordionItem>
	);
};

export default PostDetailsAccordian;
