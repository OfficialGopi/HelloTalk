import {
  User as FaceIcon,
  AtSign as UserNameIcon,
  Calendar as CalendarIcon,
  FileText as BioIcon,
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
    <div className="flex flex-col items-center gap-8 p-6 rounded-2xl shadow-xl border border-neutral-500/50 w-full max-w-md mx-auto">
      {/* Avatar */}
      <div className="relative">
        <img
          src={transformImage(user?.avatar?.url)}
          alt={user?.name || "Profile Avatar"}
          className="w-40 h-40 rounded-full object-cover border-4 border-neutral-200 dark:border-neutral-800 shadow-lg"
        />
      </div>

      {/* Profile Fields */}
      <div className="w-full flex flex-col gap-4">
        <ProfileCard
          heading="Username"
          text={user?.username}
          Icon={<UserNameIcon size={18} />}
        />
        <ProfileCard
          heading="Bio"
          text={user?.bio}
          Icon={<BioIcon size={18} />}
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
  <div className="flex items-start gap-3 p-4 rounded-xl  border-neutral-500/50 border hover:shadow-md transition-all">
    {Icon && <div className="text-neutral-500 mt-1">{Icon}</div>}
    <div className="flex flex-col">
      <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">
        {text || "—"}
      </p>
      <span className="text-sm text-neutral-500">{heading}</span>
    </div>
  </div>
);

export default Profile;
