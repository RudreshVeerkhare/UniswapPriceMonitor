const Big = require("big.js");
const blk = require("./blockchain");
const UniswapV2Pair = require("./abi/IUniswapV2Pair.json");

// define address of Pair contract
const PAIR_ADDR = "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11";
const PAIR_NAME = "ETH/DAI";
const INTERVAL = 1000;

// create web3 contract object
const PairContractHTTP = new blk.web3http.eth.Contract(
    UniswapV2Pair.abi,
    PAIR_ADDR
);
const PairContractWSS = new blk.web3ws.eth.Contract(
    UniswapV2Pair.abi,
    PAIR_ADDR
);

// reserve state
const state = {
    blockNumber: undefined,
    token0: undefined,
    token1: undefined,
};

// function to get reserves
const getReserves = async (ContractObj) => {
    // call getReserves function of Pair contract
    const _reserves = await ContractObj.methods.getReserves().call();

    // return data in Big Number
    return [Big(_reserves.reserve0), Big(_reserves.reserve1)];
};

// sleep function to pause program
const sleep = (timeInMs) =>
    new Promise((resolve) => setTimeout(resolve, timeInMs));

const mainHTTP = async () => {
    // check price continuously
    while (true) {
        // get reserves
        const [amtToken0, amtToken1] = await getReserves(PairContractHTTP);

        // calculate price and print
        console.log(
            `Price ${PAIR_NAME} : ${amtToken0.div(amtToken1).toString()}`
        );

        // wait for some time
        await sleep(INTERVAL);
    }
};

const updateState = (data) => {
    // update state
    state.token0 = Big(data.returnValues.reserve0);
    state.token1 = Big(data.returnValues.reserve1);
    state.blockNumber = data.blockNumber;

    // calculate price and print
    console.log(
        `${state.blockNumber} Price ${PAIR_NAME} : ${state.token0
            .div(state.token1)
            .toString()}`
    );
};

const mainWSS = async () => {
    // fetch current state of reserves
    [state.token0, state.token1] = await getReserves(PairContractHTTP);

    // get current block number
    state.blockNumber = await blk.web3http.eth.getBlockNumber();

    // subscribe to Sync event of Pair
    PairContractWSS.events.Sync({}).on("data", (data) => updateState(data));

    // calculate price and print
    console.log(
        `${state.blockNumber} Price ${PAIR_NAME} : ${state.token0
            .div(state.token1)
            .toString()}`
    );
};

mainWSS();
