import { transformImage } from "@/utils/features";

const AvatarCard = ({ avatar = [], max = 4 }) => {
  const visibleAvatars = avatar.slice(0, max);
  const extraCount = avatar.length - max;

  return (
    <div className="flex items-center -space-x-3">
      {visibleAvatars.map((i, index) => (
        <img
          key={index}
          src={transformImage(i)}
          alt={`Avatar ${index}`}
          className="w-10 h-10 rounded-full border-2 border-neutral-900 object-cover"
        />
      ))}

      {extraCount > 0 && (
        <div className="w-10 h-10 rounded-full border-2 border-neutral-900 bg-neutral-700 flex items-center justify-center text-xs text-white">
          +{extraCount}
        </div>
      )}
    </div>
  );
};

export default AvatarCard;
