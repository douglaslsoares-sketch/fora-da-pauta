import { CampaignPage } from "@/components/CampaignPage";
import { campaigns } from "@/data/campanhas";

export default function Home() {
  return <CampaignPage campaign={campaigns[0]} />;
}
