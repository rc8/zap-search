import { emojis } from "shared/defs";
import type { ProviderInfo } from "shared/defs";

interface ProviderSelectorProps {
  providers: ProviderInfo[];
  selectedProviders: ProviderInfo[];
  handleProviderChange: (provider: ProviderInfo) => void;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  providers,
  selectedProviders,
  handleProviderChange,
}) => (
  <div className="dropdown input-bordered w-full mb-2 z-10">
    <label
      tabIndex={0}
      className="btn w-full justify-between btn-bordered bg-base-100 border border-white border-opacity-10 hover:bg-base-100 hover:border-white hover:border-opacity-10"
    >
      {selectedProviders.length > 0
        ? `${selectedProviders.length} provider(s) selected`
        : "Select providers"}
      <span className="ml-2">▼</span>
    </label>
    <ul
      tabIndex={0}
      className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full overflow-y-auto z-10"
    >
      {providers.map((provider) => (
        <li key={provider.id} className="w-full">
          <label className="label cursor-pointer flex flex-col items-start">
            <div className="flex items-center w-full">
              <input
                type="checkbox"
                className="checkbox mr-2"
                checked={selectedProviders.map((e) => e.id).includes(provider.id)}
                onChange={() => {
                  const sameAction =
                    selectedProviders.length > 0
                      ? selectedProviders.some((e) => e.action === provider.action)
                      : true;
                  if (sameAction) {
                    handleProviderChange(provider);
                  }
                }}
              />
              <span className="flex-grow">
                {emojis[provider.category]} {provider.name} {provider.notice}
              </span>
            </div>
          </label>
        </li>
      ))}
    </ul>
  </div>
);

export default ProviderSelector;