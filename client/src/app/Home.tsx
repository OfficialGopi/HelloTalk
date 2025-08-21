import AppLayout from "@/components/layout/AppLayout";

const Home = () => {
  return (
    <div className="h-full w-full bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center">
      <p className="p-8 text-lg font-medium text-center text-neutral-800 dark:text-neutral-200">
        Select a friend to chat
      </p>
    </div>
  );
};

export default AppLayout()(Home);
