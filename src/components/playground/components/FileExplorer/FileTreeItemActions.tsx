import { Plus, Folder, Trash2, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FileTreeItemActionsProps {
	isDirectory: boolean;
	onCreateFile: () => void;
	onCreateFolder: () => void;
	onDelete: () => void;
	onRename: () => void;
	dropdownOpen: boolean;
	onDropdownOpenChange: (open: boolean) => void;
}

export function FileTreeItemActions({
	isDirectory,
	onCreateFile,
	onCreateFolder,
	onDelete,
	onRename,
	dropdownOpen,
	onDropdownOpenChange,
}: FileTreeItemActionsProps) {
	return (
		<DropdownMenu open={dropdownOpen} onOpenChange={onDropdownOpenChange}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
					onClick={(e) => e.stopPropagation()}
				>
					<MoreHorizontal className="w-3 h-3" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{isDirectory && (
					<>
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation();
								onCreateFile();
							}}
						>
							<Plus className="w-4 h-4 mr-2" />
							New File
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation();
								onCreateFolder();
							}}
						>
							<Folder className="w-4 h-4 mr-2" />
							New Folder
						</DropdownMenuItem>
					</>
				)}
				<DropdownMenuItem
					onClick={(e) => {
						e.stopPropagation();
						onRename();
					}}
				>
					<Pencil className="w-4 h-4 mr-2" />
					Rename
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={(e) => {
						e.stopPropagation();
						onDelete();
					}}
					className="text-destructive"
				>
					<Trash2 className="w-4 h-4 mr-2" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
