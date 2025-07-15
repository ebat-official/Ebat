import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { TemplateFramework } from "@/db/schema/enums";
import { ChallengeTemplate } from "@/utils/types";
import { Edit, Info, Trash2 } from "lucide-react";
import React from "react";
import { FRAMEWORK_ICONS } from "../constants";
import SavedTemplatesSkeleton from "./SavedTemplatesSkeleton";

interface SavedTemplatesListProps {
	challengeTemplates: ChallengeTemplate[];
	dataLoading: boolean;
	onEditTemplate: (template: ChallengeTemplate) => void;
	onDeleteTemplate: (framework: TemplateFramework) => void;
}

const SavedTemplatesList: React.FC<SavedTemplatesListProps> = ({
	challengeTemplates,
	dataLoading,
	onEditTemplate,
	onDeleteTemplate,
}) => {
	const formatFrameworkName = (framework: string) => {
		return framework.toLowerCase().replace(/(^|\s)\S/g, (L) => L.toUpperCase());
	};

	if (dataLoading) {
		return <SavedTemplatesSkeleton />;
	}

	if (challengeTemplates.length === 0) {
		return null;
	}

	return (
		<div className="mt-4">
			<div className="flex items-center gap-2 mb-3">
				<h5 className="text-sm font-medium">Saved Templates</h5>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Info className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
						</TooltipTrigger>
						<TooltipContent>
							<p>Frameworks which this question can be resolved with</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
				{challengeTemplates.map((template) => {
					const FrameworkIcon = FRAMEWORK_ICONS[template.framework];
					return (
						<div
							key={template.framework}
							className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:shadow-md transition-all duration-200"
						>
							<div className="flex items-center gap-3">
								<FrameworkIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
								<div>
									<p className="font-medium text-sm text-gray-900 dark:text-gray-100">
										{formatFrameworkName(template.framework)}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										Template ready
									</p>
								</div>
							</div>
							<div className="flex items-center gap-1">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => onEditTemplate(template)}
												className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
											>
												<Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Edit template</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => onDeleteTemplate(template.framework)}
												className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
											>
												<Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Delete template</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export { SavedTemplatesList };
