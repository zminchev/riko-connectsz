export default function Home() {
  return null;
}

export const getServerSideProps = async () => {
  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
};
