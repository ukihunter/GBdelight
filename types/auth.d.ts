export type SignupProps = {
  Form: {
    name: string;
    email: string;
    password: string;
  };
  Setform: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      password: string;
    }>
  >;
  onSignUpPress: () => void;
};
