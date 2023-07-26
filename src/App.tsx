import { useEffect, useLayoutEffect, useState } from "react";

import "./index.css";
import { GiHearts, GiTreasureMap } from "react-icons/gi";
import { GiCutDiamond } from "react-icons/gi";
import { BiSearchAlt } from "react-icons/bi";

import { toast } from "react-toastify";
import { Modal } from "./components/Modal";

// DONE: colocar o personagem em uma posicao aleatoria
// DONE: gerar pistas em posicoes aleatorias
// DONE: se o jogador por cima tem que apagar a pista
// DONE: se o jogador tambem tem que remover a vida se preciso
// DONE: nao mostrar mais notificações quando perder ou ganhar

// TODO: separar as funções

// buges
// TODO: remover pista ao passar por cima

// TODO: parar boneco quando perder ou ganhar

const LIFE_INITIAL = 3;
const LIFE_TOTAL = 3;

const NUM_COLUNAS = 10;
const NUM_LINHAS = 5;

const array = [...new Array(50)];
interface IClue {
  position: number;
  removeLife: boolean;
  found: boolean;
  bonus: boolean;
  treasure: boolean;
}

function App() {
  const [position, setPosition] = useState(0);

  const [life, setLife] = useState(LIFE_INITIAL);
  const [gameState, setGameState] = useState("playing");

  const [openLostModal, setOpenLostModal] = useState(false);
  const [openWinModal, setOpenWinModal] = useState(false);
  const [foundTreasure, setFoundTreasure] = useState(false);

  const [clues, setClues] = useState<{ [position: string]: IClue }>({});

  const [loading, setLoading] = useState(true);

  const movePosition = (move: "right" | "left" | "up" | "down") => {
    if (gameState === "playing") {
      const colunaAtual = position % NUM_COLUNAS;
      const linhaAtual = Math.floor(position / NUM_COLUNAS);

      if (move === "right" && colunaAtual < NUM_COLUNAS - 1)
        setPosition((prevPosition) => prevPosition + 1);
      if (move === "left" && colunaAtual > 0)
        setPosition((prevPosition) => prevPosition - 1);
      if (move === "up" && linhaAtual > 0)
        setPosition((prevPosition) => prevPosition - NUM_COLUNAS);
      if (move === "down" && linhaAtual < NUM_LINHAS - 1)
        setPosition((prevPosition) => prevPosition + NUM_COLUNAS);
    }
  };

  useEffect(() => {
    const func = (event: any) => {
      // event.preventDefault();
      const code = event.code;

      if (code === "ArrowRight") movePosition("right");
      if (code === "ArrowLeft") movePosition("left");
      if (code === "ArrowUp") movePosition("up");
      if (code === "ArrowDown") movePosition("down");
    };

    window.addEventListener("keydown", func);

    const auxClues = clues;

    if (
      auxClues?.[position]?.position === position &&
      foundTreasure === false
    ) {
      if (auxClues[position].removeLife && auxClues[position].found === false) {
        setLife((prevLife) => prevLife - 1);
        toast.error("Você perdeu 1 vida!");
      }

      if (auxClues[position].bonus && auxClues[position].found === false) {
        const tesouro = Object.values(clues).find((obj) => obj.treasure);

        const linhaTesouro = tesouro
          ? Math.floor(tesouro?.position / NUM_COLUNAS)
          : 0;

        toast.success(`O tesouro está na linha ${linhaTesouro + 1}`, {
          autoClose: 4000,
        });
      }

      if (auxClues[position].treasure && auxClues[position].found === false) {
        toast.dismiss();
        setOpenWinModal(true);
        setFoundTreasure(true);
        setGameState("won");
      }

      auxClues[position].found = true;

      setClues(auxClues);
    }

    return () => window.removeEventListener("keydown", func);
    //eslint-disable-next-line
  }, [position, clues]);
  
  useEffect(() => {
    if (life === 0 && foundTreasure === false) {
      toast.dismiss();
      setOpenLostModal(true);
      setGameState("lost");
    }
    //eslint-disable-next-line
  }, [life]);

  const loadInformation = async () => {
    setLoading(true);
    const resp = await fetch(
      "https://treasure-hunt-back-production.up.railway.app/positions",
      {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ total: array.length - 1 }),
      }
    ).then((res) => res.json());

    setClues(resp.clues);
    setPosition(resp.positionPlayer);
    setLoading(false);
    setOpenWinModal(false);
    setOpenLostModal(false);
    setGameState("playing");
    setLife(LIFE_INITIAL);
    setFoundTreasure(false);
  };

  useLayoutEffect(() => {
    loadInformation();
  }, []);

  return (
    <>
      <Modal open={openLostModal}>
        <img
          src="/images/derrota2.jpg"
          alt="Imagem de vencedor"
          className="w-40 h-40 rounded-full mx-auto"
        />
        <p className="text-2xl font-bold text-center ">
          Você perdeu! Tente novamente
        </p>
        <div className="flex justify-center items-center">
          <button
            onClick={loadInformation}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-700 text-white "
          >
            Jogar Novamente
          </button>
        </div>
      </Modal>
      <Modal open={openWinModal}>
        <img
          src="/images/tesouro.jpg"
          alt="Imagem de vencedor"
          className="w-40 h-40 rounded-full mx-auto"
        />
        <p className="text-2xl font-bold text-center">Você ganhou, parabéns!</p>
        <div className="flex justify-center items-center">
          <button
            onClick={loadInformation}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-700 text-white "
          >
            Jogar Novamente
          </button>
        </div>
      </Modal>
      <div className="relative h-screen w-full flex flex-col">
        <div className="flex justify-between items-center w-full mt-5 lg:mt-10 px-10">
          <div className="w-full">
            <p
              className="font-bold text-3xl"
              style={{
                fontFamily: "Pirata One",
                display: "flex",
                alignItems: "center",
              }}
            >
              <GiHearts size={45} style={{ marginRight: "10px" }} /> {life} /{" "}
              {LIFE_TOTAL}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <GiCutDiamond size={45} className="text-white" />
            <h1
              className="text-4xl lg:text-6xl font-bold"
              style={{ fontFamily: "Pirata One" }}
            >
              Caça ao Tesouro
            </h1>
            <GiTreasureMap size={55} className="text-white" />
          </div>
          <div className="w-full" />
        </div>
        <div className="mt-10 mx-auto w-full max-w-4xl h-full">
          {loading ? (
            <div className="grid grid-cols-10 bg-neutral-100 opacity-40 border animate-pulse">
              {array.map((_, index) => (
                <div key={index} className={`aspect-square p-2 lg:p-6`}></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-10 border">
              {array.map((_, index) => (
                <div
                  key={index}
                  className={`aspect-square flex justify-center items-center p-2 lg:p-6 border bg-cover bg-center bg-no-repeat 
                ${
                  index == position
                    ? "bg-[url('/images/pirate_person.png')]"
                    : ""
                }
                `}
                >
                  {clues[index] && clues[index].found === false ? (
                    <BiSearchAlt size={30} />
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="absolute bottom-5 lg:bottom-10 right-5 lg:right-10 grid grid-cols-3 gap-2 divide divide-black">
          <div />
          <div
            onClick={() => movePosition("up")}
            className="h-10 lg:h-12 w-10 lg:w-12 flex justify-center items-center bg-cover bg-center bg-[url('/images/seta2.png')] -rotate-90"
          ></div>
          <div />
          <div
            onClick={() => movePosition("left")}
            className="h-10 lg:h-12 w-10 lg:w-12 bg-cover bg-center bg-[url('/images/seta2.png')] rotate-180"
          ></div>
          <div
            onClick={() => movePosition("down")}
            className="h-10 lg:h-12 w-10 lg:w-12 bg-cover bg-center bg-[url('/images/seta2.png')] rotate-90"
          ></div>
          <div
            onClick={() => movePosition("right")}
            className="h-10 lg:h-12 w-10 lg:w-12 bg-cover bg-center bg-[url('/images/seta2.png')]"
          ></div>
        </div>
      </div>
    </>
  );
}

export default App;
