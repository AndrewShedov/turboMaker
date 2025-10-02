export const config = {
    uri: 'mongodb://127.0.0.1:27017',
    db: 'crystal',
    collection: 'posts',
    numberThreads: 'max',
    numberDocuments: 1_000_000,
    batchSize: 10_000,
    timeStepMs: 20
};

export async function generatingData({
    createdAt,
    updatedAt
}) {

    return {
        title: "Zorvian kalyra zorvian astronae mirthos. Nuvion nexura vorthal nexura kalyra dravion. #Mars tarnyx vireon kalyra eltheon zorvian vorthal cryonex.",
        text: "Nuvion velthara lurexis zenthul dravion velthara zenthul solvenar. Skavari velthara tarnyx nuvion orleth #Jupiter. Ximora nexura nexura lurexis nexura zorvian gralith #text #Saturn velmari solvenar virella. Lunara virella zorvian thalor nexura zephirion #Leda. Thalor lurexis velmari lunara virella #Triton #Ceres zenthul thelux gralith. Eltheon kalyra quarnex orleth mirthos solvenar. Zenthul nuvion zephirion zenthul dravion yxelan velmari zephirion. Vorthal ximora zenthul yxelan yxelan kalyra tarnyx #Haumea cryonex #Ceres ximora. Vireon nexura skavari kalyra. Astronae dravion skavari vireon thalor zenthul. Tarnyx velthara lunara skavari. Vireon lurexis vorthal velmari velmari.",
        createdAt,
        updatedAt
    };
}