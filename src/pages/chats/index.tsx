const ChatsIndex = () => {
  return null;
};

export default ChatsIndex;

export const getServerSideProps = async () => {
  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
};
