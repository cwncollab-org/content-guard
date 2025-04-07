import { Box, Paper, Stack } from "@mui/material";
import ComputerIcon from "@mui/icons-material/Computer";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import ClockIcon from "@mui/icons-material/AccessAlarmOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";

export function ExamineeInfo() {
  return (
    <Paper
      variant="outlined"
      sx={{ fontSize: "0.9rem", height: 48, overflow: "hidden" }}
    >
      <Stack
        direction="row"
        spacing={0}
        alignItems="center"
        sx={{ height: "100%" }}
      >
        <Box
          sx={{
            px: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ComputerIcon color="primary" /> เลขที่นั่งสอบ 5
        </Box>
        <Box
          sx={{
            px: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
          }}
        >
          <BadgeIcon color="primary" /> 1-5555-12345-67-8
        </Box>
        <Box sx={{ flexGrow: 1 }}></Box>
        <Box
          sx={{
            px: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
          }}
        >
          <PersonIcon color="primary" /> ภาสกร สุริยะกูล
        </Box>
        <Box
          sx={{
            px: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ClockIcon color="primary" /> เหลือเวลา 00:30:20
        </Box>
      </Stack>
    </Paper>
  );
}
