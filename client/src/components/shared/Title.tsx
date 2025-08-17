const Title = ({
  title = "Hello Talk",
  description = "This is the Chat App called HelloTalk",
}) => {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
    </>
  );
};

export default Title;
