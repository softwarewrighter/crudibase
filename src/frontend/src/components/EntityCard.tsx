export interface Entity {
  id: string;
  label: string;
  description?: string;
  aliases?: string[];
}

export interface EntityCardProps {
  entity: Entity;
  onClick?: (entity: Entity) => void;
  onAddToCollection?: (entity: Entity) => void;
}

export function EntityCard({
  entity,
  onClick,
  onAddToCollection,
}: EntityCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(entity);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onAddToCollection) {
      onAddToCollection(entity);
    }
  };

  return (
    <div
      className={`border border-gray-200 rounded-lg p-4 ${
        onClick ? 'cursor-pointer hover:bg-gray-50 hover:shadow-md' : ''
      } transition-all`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {entity.label}
            </h3>
            <span className="text-sm text-gray-500 font-mono">{entity.id}</span>
          </div>

          {entity.description && (
            <p className="mt-1 text-sm text-gray-600">{entity.description}</p>
          )}

          {entity.aliases && entity.aliases.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {entity.aliases.slice(0, 3).map((alias, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                >
                  {alias}
                </span>
              ))}
              {entity.aliases.length > 3 && (
                <span className="px-2 py-0.5 text-xs text-gray-500">
                  +{entity.aliases.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {onAddToCollection && (
          <button
            onClick={handleAddClick}
            className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            aria-label="Add to collection"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}
