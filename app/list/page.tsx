import ProtectedPage from "../ProtectedPage";
import ContributionList from "./ContributionList";

export default function ListPage() {
  return (
    <ProtectedPage isUserPage>
      <ContributionList />
    </ProtectedPage>
  )
}
