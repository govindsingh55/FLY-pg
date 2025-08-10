import { signInAction } from './sign-in-action'
import SignInForm from './sign-in-form'

export default function SignInPage() {
  return <SignInForm onSubmit={signInAction} />
}
