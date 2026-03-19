import React, { useId } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function FavoriteToggle({
  checked,
  onChange,
  size = "default",
  ariaLabel,
  disabled = false,
  title = "",
}) {
  const id = useId();
  const sizeClass = size === "small" ? "small" : "";
  const disabledClass = disabled ? "disabled" : "";

  return (
    <label
      className={`fav ${sizeClass} ${disabledClass}`.trim()}
      htmlFor={id}
      aria-label={ariaLabel || "Toggle favorite"}
      title={title}
    >
      <input
        id={id}
        type="checkbox"
        className="fav-toggle"
        checked={!!checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />

      {checked ? (
        <FaHeart className="heart-icon active" aria-hidden="true" />
      ) : (
        <FaRegHeart className="heart-icon" aria-hidden="true" />
      )}
    </label>
  );
}
