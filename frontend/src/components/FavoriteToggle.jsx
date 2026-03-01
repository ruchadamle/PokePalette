import React, { useId } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function FavoriteToggle({
  checked,
  onChange,
  size = "default",
  ariaLabel,
}) {
  const id = useId();
  const sizeClass = size === "small" ? "small" : "";

  return (
    <label
      className={`fav ${sizeClass}`.trim()}
      htmlFor={id}
      aria-label={ariaLabel || "Toggle favorite"}
    >
      <input
        id={id}
        type="checkbox"
        className="fav-toggle"
        checked={!!checked}
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
