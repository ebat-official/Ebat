// hooks/useCompanies.ts
import { useMemo, useCallback, ReactElement, useState, useEffect } from "react";
import { IconType } from "react-icons";
import companiesData from "@/utils/companyListConfig";

export interface Company {
	label: string;
	icon: ReactElement;
}
export interface CompanyList {
	label: string;
	icon: IconType;
}

const useCompanies = () => {
	const normalizeCompanies = useMemo<Company[]>(
		() => normalizeCompaniesData(companiesData),
		[],
	);
	const [companies, setCompanies] = useState<Company[]>(normalizeCompanies);

	useEffect(() => {
		return () => {
			setCompanies(normalizeCompanies); // Reset to original list
		};
	}, [normalizeCompanies]);

	function normalizeCompaniesData(data: CompanyList[]): Company[] {
		return data.map((company) => {
			return {
				label: company.label,
				icon: <company.icon />,
			};
		});
	}

	// Memoizing the search function for better performance on repeated renders
	const searchedCompanies = useCallback(
		(query: string): Company[] => {
			// Filtering companies based on the search query (case-insensitive)
			return normalizeCompanies.filter((company) =>
				company.label.toLowerCase().includes(query.toLowerCase()),
			);
		},
		[companies],
	);

	const searchCompanies = (query: string) => {
		setCompanies(searchedCompanies(query));
	};

	return { companies, searchCompanies };
};

export default useCompanies;
