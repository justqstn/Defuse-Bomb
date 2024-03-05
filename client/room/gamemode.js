/*
Закладка бомбы
by just_qstn
*/

// Импорт модулей
import * as Basic from 'pixel_combats/basic';
import * as API from 'pixel_combats/room';
import * as ColorsLib from './colorslib.js';
import * as JQUtils from './jqutils.js';

// Константы 
const ADMIN = ["9DE9DFD7D1F5C16","AEC76560AA6B5750","BACDC54C07D66B94A","2F1955AAE64508B9"],
    BANNED = "C3EB1387A99FC76EDAAA9FBB8CCA3CD90",
    STATES = {
        "Waiting": 0,
        "Warmup": 1,
        "Preround": 2,
        "Round": 3,
        "Endround": 4,
        "ChangeTeams": 5,
        "Endgame": 6,
        "Clearing": 7
    };

// Конфигурация
const
    ROUNDS = API.GameMode.Parameters.GetBool("short_game") ? 16 : 30,
    LOADING_TIME = 10, 					// время загрузки
    WARMUP_TIME = 90, 					// время разминки
    PRE_ROUND_TIME = 45, 				// время покупки снаряжения
    ROUND_TIME = 150, 					// время раунда
    AFTER_ROUND_TIME = 10, 				// время после раунда
    END_TIME = 15, 						// время после игры
    BEFORE_PLANTING_TIME = 60, 			// время после закладки бомбы
    BOMB_PLANTING_TIME = 3, 			// время закладки бомбы
    BOMB_DEFUSE_TIME = 7, 				// время разминирования бомбы без набора сапера
    BOMB_DEFUSEKIT_TIME = 3, 			// время разминирования бомб с набором сапера
    HELMET_HP = 130, 					// хп с шлемом
    VEST_HP = 160,						// хп с бронежилетом и шлемом
    SECONDARY_COST = 650, 				// стоимость вторичного оружия
    MAIN_COST = 2850, 					// стоимость основного оружия
    EXPLOSIVE_COST = 300, 				// стоимость взрывчатки
    DEFUSEKIT_COST = 350, 				// стоимость набора сапера
    HELMET_COST = 650, 					// стоимость шлема
    VEST_COST = 1200, 					// стоимость бронежилета с шлемом
    DEFAULT_MONEY = 1000, 				// сколько денег давать на спавне
    MAX_MONEY = 6000, 					// максимальное количество денег
    BOUNTY_WIN = 1500, 					// награда за победу
    BOUNTY_LOSE = 800, 					// награда за поражение * лусбонус
    BOUNTY_LOSE_BONUS = 500, 			// лусбонус (за каждое поражение он увеличивается на кол-во поражений)
    BOUNTY_KILL = 250, 					// награда за убийство
    BOUNTY_PLANT = 300, 				// награда за закладку бомбы
    BOUNTY_DEFUSE = 500, 				// награда за разминирование
    MAX_LOSS_BONUS = 5;					// максимальный лусбонус

// Доступ к функциям и модулям из "терминала"
globalThis.API = API;
globalThis.JQUtils = JQUtils;
globalThis.ColorsLib = ColorsLib;
globalThis.Basic = Basic;

// Переменные
let Properties = API.Properties.GetContext(), Timers = API.Timers.GetContext(), Ui = API.Ui.GetContext();
let MainTimer = Timers.Get("main"), State = Properties.Get("state"), Blacklist = Properties.Get("banned");

// Настройки
API.Map.Rotation = API.GameMode.Parameters.GetBool("MapRotation");
State.Value = STATES.Waiting;
Blacklist.Value = BANNED;

// Создание команд
let CounterTerrorists = JQUtils.CreateTeam("ct", {name: "Спецназ", undername: "Закладка бомбы от just_qstn", isPretty: true}, ColorsLib.Colors.SteelBlue);
let Terrorists = JQUtils.CreateTeam("t", {name: "Террористы", undername: "Закладка бомбы от just_qstn", isPretty: true}, ColorsLib.Colors.BurlyWood)

// Интерфейс
API.LeaderBoard.PlayerLeaderBoardValues = [
    {
        Value: "Kills",
        DisplayName: "Убийства",
        ShortDisplayName: "Убийства"
    },
    {
        Value: "Deaths",
        DisplayName: "Смерти",
        ShortDisplayName: "Смерти"
    },
    {
        Value: "Scores",
        DisplayName: "Деньги",
        ShortDisplayName: "Деньги"
    },
    {
        Value: "bomb",
        DisplayName: "Бомба",
        ShortDisplayName: "Бомба"
    },
    {
        Value: "defkit",
        DisplayName: "Сапер",
        ShortDisplayName: "Сапер"
    }
];

API.LeaderBoard.PlayersWeightGetter.Set(function (p) {
    return p.Properties.Get("Kills").Value;
});

Ui.TeamProp1.Value = { Team: "t", Prop: "hint" };
Ui.TeamProp2.Value = { Team: "ct", Prop: "hint" };
Ui.MainTimerId.Value = MainTimer.Id;

// События
API.Teams.OnRequestJoinTeam.Add(function (p, t) {
    if (p.Team == null)
    {
        if (p.Properties.Get("banned").Value == null && Blacklist.Value.search(p.Id) != -1) {
            BanPlayer(p);
        }
        else {
            p.Properties.Get("banned").Value = false;
            p.Properties.Scores.Value = DEFAULT_MONEY;
            p.Properties.Get("bomb").Value = false;
            p.Properties.Get("defkit").Value = false;
        }
    }
    JoinToTeam(p, t);
    if (!p.Spawns.IsSpawned && (State.Value == STATES.Round || State.Value == STATES.Endround)) {
        p.Spawns.Spawn();
        p.Spawns.Despawn();
        p.PopUp("Игра уже началась. Ждите конца игры");
    } else p.Spawns.Spawn();
});

API.Players.OnPlayerConnected.Add(function (p) {
    JoinToTeam(p, Terrorists);
    JQUtils.pcall(() => {
        JoinToTeam(p);
        if (Blacklist.Value.search(p.Id) != -1) {
            BanPlayer(p);
        }
        else {
            p.Properties.Get("banned").Value = false;
        }
    }, true);
});

// Функции
function JoinToTeam(p, t = Terrorists)
{
    let CT_Count = CounterTerrorists.Count - (p.Team == CounterTerrorists ? 1 : 0),
        T_Count = Terrorists.Count - (p.Team == Terrorists ? 1 : 0);
    if (CT_Count != T_Count) {
        if (CT_Count < T_Count) CounterTerrorists.Add(p);
        else if (CT_Count > T_Count) Terrorists.Add(p);
    }
    else t.Add(p);
}

function BanPlayer(p) {
    p.Spawns.Spawn();
    p.Spawns.Despawn();
    p.Properties.Get("banned").Value = true;
    p.PopUp("<size=45><B>Вы забанены!</B></size>\n<i>Считаете, что забанены не по делу? Пишите в Issue в репозитории на GitHub.</i>");
}
