import { Edit, Trash, Undo2, X, MoreVertical, ChevronDown, ChevronRight } from "lucide-react";
import { FoodItem } from "@shared/schema";
import { getDaysUntilExpiry, getCountdownStatus, formatExpiryDate, formatUploadDate, getDaysUntilTrashClear, isExpired } from "@/lib/date-utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FoodItemCardProps {
  item: FoodItem;
  isDeleted?: boolean;
  hasExpiredInMonth?: boolean; // If true, don't auto-collapse items in this month
  onEdit?: (item: FoodItem) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
}


export default function FoodItemCard({ 
  item, 
  isDeleted = false,
  hasExpiredInMonth = false,
  onEdit, 
  onDelete, 
  onRestore, 
  onPermanentDelete 
}: FoodItemCardProps) {
  const daysRemaining = getDaysUntilExpiry(item.expiryDate);
  const status = getCountdownStatus(daysRemaining);
  // Auto-expand if expiring within 15 days OR if month has expired items
  const [isExpanded, setIsExpanded] = useState(daysRemaining <= 15 || hasExpiredInMonth);
  
  if (isDeleted) {
    const daysUntilClear = item.deletedAt ? getDaysUntilTrashClear(item.deletedAt) : 0;
    const itemExpired = isExpired(item.expiryDate);
    
    return (
      <div className="glass-card rounded-2xl p-3 opacity-70 animate-fade-in hover:opacity-85 transition-all duration-300" data-testid={`deleted-item-${item.id}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-1">
              <h3 className="text-sm font-medium line-through truncate" data-testid="item-name">
                {item.name}
              </h3>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground truncate" data-testid="deleted-date">
                Deleted: {item.deletedAt ? formatExpiryDate(item.deletedAt) : 'Unknown'}
              </span>
              <span className="text-xs text-orange-400" data-testid="trash-countdown">
                {daysUntilClear > 0 
                  ? `Auto-clear in ${daysUntilClear}d`
                  : 'Ready for auto-clear'
                }
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {!itemExpired && (
              <button 
                className="p-2 hover:bg-green-500/20 rounded-lg transition-all duration-200 hover:scale-110"
                onClick={() => onRestore?.(item.id)}
                data-testid={`restore-item-${item.id}`}
              >
                <Undo2 className="w-4 h-4 text-green-400" />
              </button>
            )}
            <button 
              className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200 hover:scale-110 group"
              onClick={() => onPermanentDelete?.(item.id)}
              data-testid={`permanent-delete-${item.id}`}
            >
              <X className="w-4 h-4 text-destructive group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in hover:shadow-xl transition-all duration-300" data-testid={`food-item-${item.id}`}>
      {/* Collapsed View - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between gap-3 hover:bg-accent/50 transition-all duration-200"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="text-muted-foreground">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 transition-transform duration-200" />
            ) : (
              <ChevronRight className="w-4 h-4 transition-transform duration-200" />
            )}
          </div>
          <h3 className="text-sm font-medium truncate" data-testid="item-name">
            {item.name}
          </h3>
        </div>
        
        <span 
          className={`countdown-badge ${status} flex-shrink-0`}
          data-testid="countdown-badge"
        >
          {daysRemaining < 0 ? 'Expired' : `${daysRemaining}d`}
        </span>
      </button>

      {/* Expanded View - Details */}
      {isExpanded && (
        <div className="px-3 pb-3 animate-fade-in border-t border-border/50 pt-3">
          {/* Expiry Date & Actions Row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground flex-1 truncate" data-testid="expiry-date">
              Expires: {formatExpiryDate(item.expiryDate)}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="p-2 hover:bg-accent rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0"
                  data-testid={`actions-menu-${item.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-card p-3">
                {/* Details Section - Not clickable */}
                <div className="pb-3 mb-3 border-b border-border/30">
                  <h4 className="text-xs font-semibold text-foreground mb-2">Details</h4>
                  {item.createdAt && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground">Upload Date & Time:</p>
                      <p className="text-xs text-foreground">{formatUploadDate(item.createdAt)}</p>
                    </div>
                  )}
                  {item.notes ? (
                    <div>
                      <p className="text-xs text-muted-foreground">Notes:</p>
                      <p className="text-xs text-foreground leading-relaxed">{item.notes}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-muted-foreground">Notes:</p>
                      <p className="text-xs text-muted-foreground italic">No notes added</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(item);
                  }}
                  className="cursor-pointer"
                  data-testid={`edit-item-${item.id}`}
                >
                  <Edit className="w-4 h-4 mr-2 text-blue-400" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(item.id);
                  }}
                  className="cursor-pointer text-destructive focus:text-destructive"
                  data-testid={`delete-item-${item.id}`}
                >
                  <Trash className="w-4 h-4 mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
}
