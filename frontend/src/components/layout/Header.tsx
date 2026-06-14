import React from "react";
import { Avatar, Layout, Typography, Dropdown, Badge } from "antd";
import type { MenuProps } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useGetMeQuery } from "@/features/auth/authApi";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setUser, logout } from "@/features/auth/authSlice";
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Content } = Layout;
const { Text } = Typography;

export const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);

  const { data } = useGetMeQuery(undefined, { skip: !token || !!user });

  useEffect(() => {
    if (data?.data) dispatch(setUser(data.data));
  }, [data, dispatch]);

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "?";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "header",
      label: (
        <div style={{ padding: "4px 0" }}>
          <Text strong style={{ display: "block", fontSize: 14 }}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {user?.email}
          </Text>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => navigate("/settings"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign out",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="mb-6 flex justify-between gap-2">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.firstName}!
        </h1>
        <p className="text-gray-600">
          Here&apos;s a quick overview of services and appointments available.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Time */}
        <div className="text-gray-600 bg-blue-100 flex items-center border border-blue-200 gap-1 rounded-full px-3 py-2">
          <Text className="text-gray-500!">⏰</Text>
          <Text className="text-gray-800! font-medium pl-2">
            {moment().format("YY-MM-DD h:mm A")}{" "}
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </Text>
        </div>
        {/* Bell */}
        <Badge dot>
          <div
            style={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              border: "1px solid #E8EAF0",
              cursor: "pointer",
              background: "#fff",
            }}
          >
            <BellOutlined style={{ color: "#6B7280", fontSize: 16 }} />
          </div>
        </Badge>

        {/* User dropdown */}
        <Dropdown
          menu={{ items: menuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <div className="flex items-center gap-8 px-4 py-2 border border-gray-300 rounded-full cursor-pointer bg-white">
            <Avatar
              icon={"😂"}
              size={28}
              className="bg-blue-200! font-xl"
              style={{
                fontWeight: 600,
              }}
            />
            <Text className="text-gray-800 font-medium text-sm">
              {user?.firstName}
            </Text>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};
