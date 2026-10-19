import { useNavigate } from "react-router-dom"
import LeaderboardHeader from "./LeaderboardHeader"
import LeaderboardStatcard from "./LeaderboardStatcard"
import LeaderboardOrders from "./LeaderboardOrders"
import { useOrders } from "@/hooks/useOrders"

const Leaderboard = () => {
  const navigate = useNavigate()
  const { orders, loading, error } = useOrders()

  return (
<section className="bg-[#fafafa] px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6 min-h-screen">
<LeaderboardHeader/>
{error ? (
  <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
    Impossible de charger les commandes : {error}
  </div>
) : (
  <>
    <LeaderboardStatcard orders={orders}/>
    <LeaderboardOrders
      orders={orders}
      loading={loading}
      onOrderClick={(orderId) => navigate(`/dashboard/leaderboard/orders/${orderId}`)}
    />
  </>
)}
</section>
  )
}

export default Leaderboard