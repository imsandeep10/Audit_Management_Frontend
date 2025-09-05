import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { teamCompositionData } from "../../constant/teamCompositionData";
import { riskManagementData } from "../../constant/riskManagement";

const ActivityLog = () => {
  return (
    <div className=" min-h-screen p-10">
      <h1 className="text-2xl font-semibold pb-5 ">Activity Log</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="card-custom">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Team Composition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <ResponsiveContainer width={300} height={250}>
                <PieChart>
                  <Pie
                    data={teamCompositionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ value }) => `${value}%`}
                    labelLine={false}
                  >
                    {teamCompositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {teamCompositionData.map((item, index) => (
                <>
                  <div key={index} className="flex items-center text-sm">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span>
                      {item.name} {item.value}
                    </span>
                  </div>
                </>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="card-custom">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Risk Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <ResponsiveContainer width={300} height={250}>
                <PieChart>
                  <Pie
                    data={riskManagementData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ value }) => `${value}%`}
                    labelLine={false}
                  >
                    {riskManagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {riskManagementData.map((item, index) => (
                <>
                  <div key={index} className="flex items-center text-sm">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span>
                      {item.name} {item.value}
                    </span>
                  </div>
                </>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default ActivityLog;
