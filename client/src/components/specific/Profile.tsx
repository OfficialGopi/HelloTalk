import {
  User as FaceIcon,
  AtSign as UserNameIcon,
  Calendar as CalendarIcon,
} from "lucide-react";
import moment from "moment";
import { transformImage } from "@/utils/features";

const Profile = ({
  user,
}: {
  user: {
    name: string;
    username: string;
    bio: string;
    avatar: {
      url: string;
    };
    createdAt: string;
  };
}) => {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Avatar */}
      <img
        src={transformImage(user?.avatar?.url)}
        alt={user?.name || "Profile Avatar"}
        className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-md mb-4"
      />

      {/* Profile Fields */}
      <ProfileCard heading="Bio" text={user?.bio} />
      <ProfileCard
        heading="Username"
        text={user?.username}
        Icon={<UserNameIcon size={18} />}
      />
      <ProfileCard
        heading="Name"
        text={user?.name}
        Icon={<FaceIcon size={18} />}
      />
      <ProfileCard
        heading="Joined"
        text={moment(user?.createdAt).fromNow()}
        Icon={<CalendarIcon size={18} />}
      />
    </div>
  );
};

const ProfileCard = ({
  text,
  Icon,
  heading,
}: {
  text?: string;
  Icon?: React.ReactNode;
  heading: string;
}) => (
  <div className="flex items-center gap-4 text-center text-white">
    {Icon && <div className="text-neutral-400">{Icon}</div>}
    <div className="flex flex-col">
      <p className="text-base">{text || "—"}</p>
      <span className="text-sm text-neutral-500">{heading}</span>
    </div>
  </div>
);

export default Profile;
