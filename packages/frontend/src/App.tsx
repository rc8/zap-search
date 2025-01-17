import toast from "react-hot-toast";
import { useEffect, useState } from "react";

import type { FinalResult, ProviderInfo } from "shared/defs";

import AdblockNotice from "./components/AdblockNotice";
import Loader from "./components/Loader";
import SearchBar from "./components/SearchBar";
import ProviderSelector from "./components/ProviderSelector";
import SearchButton from "./components/SearchButton";
import ResultsList from "./components/ResultsList";
import FloatingFooter from "./components/FloatingFooter";

const apiUrl = import.meta.env.DEV ? "http://localhost:5180" : "";
let ranYet = false;

function App() {
  const [query, setQuery] = useState<string>("");
  const [selectedProviders, setSelectedProviders] = useState<ProviderInfo[]>([]);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [searchResults, setSearchResults] = useState<FinalResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const suggestedResults = searchResults.filter((e) => e.points >= 1);
  const otherResults = searchResults.filter((e) => e.points < 1);

  const handleProviderChange = (provider: ProviderInfo) => {
    const providerId = provider.id;
    setSelectedProviders((prev: ProviderInfo[]) => {
      // check if the provider is already in list
      if (prev.some((provider) => provider.id === providerId)) {
        // remove
        return prev.filter((provider) => provider.id !== providerId);
      } else {
        // add
        return [...prev, providers.find((provider) => provider.id === providerId)!];
      }
    });
    setSearchResults([]);
    ranYet = false;
  };

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch(apiUrl + "/api/providers");
        const data = (await response.json()) as ProviderInfo[];
        const sortedData = data.sort((a, b) => a.category.localeCompare(b.category));
        setProviders(sortedData);
      } catch (error) {
        console.error("Error fetching providers:", error);
        toast.error("Error fetching providers");
      }
    };

    fetchProviders();
  }, []);

  async function handleSearch() {
    if (selectedProviders.length === 0 || !query) {
      toast.error("Please select at least one provider and enter a query");
      return;
    }

    ranYet = true;
    setSearchResults([]);
    setLoading(true);

    try {
      const results = await fetchSearchResults();
      setSearchResults(results);
    } catch (error) {
      console.error("Error:", error);
      toast.error(String(error));
    } finally {
      setLoading(false);
    }
  }

  async function fetchSearchResults() {
    const providerIds = selectedProviders.map((e) => e.id).join(",");
    const url = `${apiUrl}/api/search?provider=${encodeURIComponent(
      providerIds
    )}&query=${encodeURIComponent(query)}`;
    const resp = await fetch(url);

    const json = await resp.json();
    console.log(json);
    if (!resp.ok && json.error) {
      throw new Error(json.error);
    } else if (!resp.ok && !json.error) {
      throw new Error("Error fetching search results.");
    } else if (resp.ok && json.error) {
      toast.error("Error fetching *some* search results:\n" + json.error);
    }

    return json.data;
  }

  return (
    <>
      <div className="p-4 flex justify-center">
        <div className="max-w-[1024px] w-full min-h-[calc(100vh-2rem)] bg-base-200 rounded-2xl p-2 mb-12">
          <SearchBar query={query} setQuery={setQuery} />
          <ProviderSelector
            providers={providers}
            selectedProviders={selectedProviders}
            handleProviderChange={handleProviderChange}
          />
          <SearchButton
            handleSearch={handleSearch}
            disabled={loading || selectedProviders.length === 0 || !query}
          />
          {loading && <Loader />}
          {!loading && searchResults.length === 0 && ranYet && (
            <div className="flex justify-center mt-32">No results</div>
          )}
          {!loading && searchResults.length > 0 && ranYet && (
            <div className="mt-2 ml-1">
              Found <span className="font-bold">{suggestedResults.length}</span> results
              {` (+${otherResults.length} less relevant).`}
            </div>
          )}
          <ResultsList searchResults={searchResults} providers={providers} />
        </div>
        <FloatingFooter />
      </div>
      <AdblockNotice />
    </>
  );
}

export default App;
