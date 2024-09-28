export const getUserLettersFromName = ({
  firstName = "",
  lastName = "",
}: {
  firstName?: string;
  lastName?: string;
}) => {
  const fallbackName = `${firstName.slice(0, 1).toUpperCase()}${lastName
    .slice(0, 1)
    .toUpperCase()}`;

  return { fallbackName };
};
