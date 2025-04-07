import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { blue, grey, orange } from "@mui/material/colors";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleIcon from "@mui/icons-material/CircleOutlined";

import { questions } from "./exam-data";
import { useState } from "react";
import { useMap } from "react-use";

export function ExamContent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const question = questions[currentQuestion];
  const [, { set: setOption, get: getOption }] = useMap();

  const handleSelectOption = (option: number) => {
    const questionId = question.id;
    setOption(questionId, option);
  };

  const handleNextQuestion = () => {
    setCurrentQuestion((prev) =>
      prev < questions.length - 1 ? prev + 1 : questions.length - 1
    );
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestion((prev) => (prev > 0 ? prev - 1 : 0));
  };

  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: grey[200],
        height: "100%",
        display: "flex",
        flexDirection: "row-reverse",
      }}
    >
      <Container sx={{ py: 1, height: "calc(100% - 48px)" }}>
        <Paper sx={{ height: "100%", py: 3, px: 2 }}>
          <Stack>
            <Box sx={{ color: grey[600] }}>
              คำถามข้อที่ {currentQuestion + 1}
            </Box>
            <Box sx={{ mt: 1, fontSize: "1.25rem" }}>{question.text}</Box>
            <Box component="ol" sx={{ m: 0, p: 0, mt: 4 }}>
              {question.options.map((option, index) => (
                <Box
                  component="li"
                  key={`${question.id}-${index}`}
                  sx={{
                    cursor: "pointer",
                    listStyle: "none",
                    fontSize: "1.25rem",
                    p: 3,
                    mb: 1,
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderRadius: 2,
                    borderColor:
                      getOption(question.id) === index
                        ? theme.palette.primary.main
                        : grey[300],
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                  onClick={() => handleSelectOption(index)}
                >
                  {getOption(question.id) === index && (
                    <CheckCircleIcon color="primary" />
                  )}
                  {getOption(question.id) !== index && (
                    <CircleIcon color="disabled" />
                  )}
                  {option}
                </Box>
              ))}
            </Box>
          </Stack>
        </Paper>
      </Container>

      {!isMobile && (
        <Paper
          sx={{
            // position: "absolute",
            // top: 0,
            // left: 0,
            // bottom: "48px",
            bgcolor: blue[100],
            width: "20rem",
            borderRadius: 0,
            p: 1,
          }}
        >
          <Stack sx={{ bgcolor: "white", p: 2, borderRadius: 2 }}>
            <Typography variant="body1">สถานะการทำแบบทดสอบ</Typography>
            <Box
              component="ol"
              sx={{
                p: 0,
                m: 0,
                mt: 1,
                display: "grid",
                gridTemplateColumns: "repeat(10, 1fr)",
                gridAutoRows: "1fr",
              }}
            >
              {questions.map((q, index) => {
                const isAnswered = getOption(q.id) !== undefined;
                return (
                  <Box
                    component="li"
                    key={q.id}
                    sx={{
                      listStyle: "none",
                      p: 0.25,
                      m: 0,
                    }}
                  >
                    <Box
                      sx={{
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        aspectRatio: 1,
                        borderColor: (t) =>
                          currentQuestion == index
                            ? orange[600]
                            : t.palette.primary.main,
                        bgcolor: isAnswered ? "primary.main" : "white",
                        color: isAnswered ? "white" : "primary.main",
                        borderWidth: 2,
                        borderStyle: "solid",
                        borderRadius: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onClick={() => setCurrentQuestion(index)}
                    >
                      {index + 1}
                    </Box>
                  </Box>
                );
              })}
            </Box>
            <Button variant="contained" color="error" sx={{ mt: 2 }}>
              สิ้นสุดการทดสอบ
            </Button>
          </Stack>
        </Paper>
      )}

      <Box
        sx={{
          position: "absolute",
          height: "48px",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setCurrentQuestion(0)}
          >
            <FirstPageIcon />
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handlePreviousQuestion()}
          >
            <NavigateBeforeIcon />
          </Button>
          <Box sx={{ minWidth: "6rem", textAlign: "center" }}>
            {currentQuestion + 1} / {questions.length}
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleNextQuestion()}
          >
            <NavigateNextIcon />
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setCurrentQuestion(questions.length - 1)}
          >
            <LastPageIcon />
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
