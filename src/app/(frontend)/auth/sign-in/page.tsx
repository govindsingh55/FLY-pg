import { signInAction } from '../auth-actions'
import SignInForm from './sign-in-form'

export default function SignInPage() {
  return <SignInForm onSubmit={signInAction} />
}
