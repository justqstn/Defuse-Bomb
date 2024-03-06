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
    },
    ENABLED = "✓",
    EMPTY = " ";

// Конфигурация
const
    ROUNDS = API.GameMode.Parameters.GetBool("short_game") ? 2 : 30,
    LOADING_TIME = 10, 					// время загрузки
    WARMUP_TIME = 10, 					// время разминки
    PRE_ROUND_TIME = 10, 				// время покупки снаряжения
    ROUND_TIME = 30, 					// время раунда
    AFTER_ROUND_TIME = 10, 				// время после раунда
    END_TIME = 15, 						// время после игры
    BEFORE_PLANTING_TIME = 5, 			// время после закладки бомбы
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
/*const
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
    MAX_LOSS_BONUS = 5;					// максимальный лусбонус*/

// Доступ к функциям и модулям из "терминала"
globalThis.API = API;
globalThis.JQUtils = JQUtils;
globalThis.ColorsLib = ColorsLib;
globalThis.Basic = Basic;

// Переменные
let Properties = API.Properties.GetContext(), Timers = API.Timers.GetContext(), Ui = API.Ui.GetContext();
let MainTimer = Timers.Get("main"), State = Properties.Get("state"), Blacklist = Properties.Get("banned"), Bomb = Properties.Get("bomb"),
    IsPlanted = Properties.Get("is_planted"), Round = Properties.Get("round");

// Настройки
API.Map.Rotation = API.GameMode.Parameters.GetBool("MapRotation");
State.Value = STATES.Waiting;
Blacklist.Value = BANNED;
Bomb.Value = false;
IsPlanted.Value = false;
Round.Value = 0;
API.Spawns.GetContext().Enable = false;
//API.room.PopUp("Закладка бомбы от just_qstn\n<size=50><i>Приятной игры!</i></size><size=30><B>Запрещенные оружия: Катана, СВД, ВСС, РПГ, Мак-11 (пистолет), РПК-74.\n<color=red>ИСПОЛЬЗОВАНИЕ ЗАПРЕЩЕННЫХ ОРУЖИЙ КАРАЕТСЯ БАНОМ!</color></size>");

// Создание команд
API.Teams.OnAddTeam.Add(function (t) {
    t.Properties.Get("loses").Value = 0;
    t.Properties.Get("wins").Value = 0;
});

let CounterTerrorists = JQUtils.CreateTeam("ct", { name: "Спецназ", undername: "Закладка бомбы от just_qstn", isPretty: true }, ColorsLib.Colors.SteelBlue, 1);
let Terrorists = JQUtils.CreateTeam("t", { name: "Террористы", undername: "Закладка бомбы от just_qstn", isPretty: true }, ColorsLib.Colors.BurlyWood, 2)

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
    if (p.Properties.Get("banned").Value == null)
    {
        if (Blacklist.Value.search(p.Id) != -1) {
            BanPlayer(p);
        }
        else {
            p.Properties.Get("banned").Value = false;
            p.Properties.Scores.Value = DEFAULT_MONEY;
            p.Properties.Get("bomb").Value = EMPTY
            p.Properties.Get("defkit").Value = EMPTY;
        }
    }
    if (p.Properties.Get("isconnected").Value)
    {
        p.Properties.Get("banned").Value = false;
        p.Properties.Scores.Value = DEFAULT_MONEY;
        p.Properties.Get("bomb").Value = EMPTY
        p.Properties.Get("defkit").Value = EMPTY;
        p.Properties.Get("isconnected").Value = null;
    }
    JoinToTeam(p, t);
    if (!p.Spawns.IsSpawned && (State.Value == STATES.Round || State.Value == STATES.Endround)) {
        p.Spawns.Spawn();
        p.Spawns.Despawn();
        p.PopUp("Игра уже началась. Ждите конца игры");
    } else p.Spawns.Spawn();
});

API.Players.OnPlayerConnected.Add(function (p) {
    JQUtils.pcall(() => {
        JoinToTeam(p, Terrorists);
        if (Blacklist.Value.search(p.Id) != -1) {
            BanPlayer(p);
        }
        else {
            p.Properties.Get("banned").Value = false;
            p.Properties.Get("isconnected").Value = true;
        }
    }, true);
});

API.Players.OnPlayerDisconnected.Add(function (p) {
    if (State.Value == STATES.Round) {
        if (GetAlivePlayersCount(Terrorists) == 0 && !IsPlanted.Value) return EndRound(CounterTerrorists);
        if (GetAlivePlayersCount(CounterTerrorists) == 0) return EndRound(Terrorists);
    }
});

API.Properties.OnPlayerProperty.Add(function (c, v) {
    if (State.Value != STATES.Clearing) {
        switch (v.Name) {
            case "Scores":
                if (v.Value > MAX_MONEY) v.Value = MAX_MONEY;
                break;
            case "Deaths":
                c.Player.Team.Properties.Get("hint").Value = `< Победы: ${c.Player.Team.Properties.Get("wins").Value} >\n\n< Живых: ${(GetAlivePlayersCount(c.Player.Team))} >`;
                if (!IsPlanted.Value && GetAlivePlayersCount(c.Player.Team) <= 0) EndRound(AnotherTeam(c.Player.Team));
                if (c.Player.Team == CounterTerrorists && IsPlanted.Value && GetAlivePlayersCount(c.Player.Team) <= 0) EndRound(Terrorists);
                break;
        }
    }
});

API.Properties.OnTeamProperty.Add(function (c, v) {
    if (v.Name != "hint") {
        c.Team.Properties.Get("hint").Value = `< Победы: ${c.Team.Properties.Get("wins").Value} >\n\n< Живых: ${(GetAlivePlayersCount(c.Team))} >`;
    }
});

API.Damage.OnKill.Add(function (p, k) {
    if (State.Value == STATES.Round || State.Value == STATES.Endround) {
        if (k.Team != null && k.Team != p.Team) {
            p.Properties.Kills.Value++;
            p.Properties.Scores.Value += BOUNTY_KILL;
        }
    }
});

API.Damage.OnDeath.Add(function (p) {
    if (State.Value == STATES.Round || State.Value == STATES.Endround) {
        p.Properties.Deaths.Value++;
        p.Properties.Get("defkit").Value = EMPTY;
        if (p.Properties.Get("bomb").Value) Bomb.Value = true;
        p.Properties.Get("bomb").Value = EMPTY;
        p.Inventory.Main.Value = false;
        p.Inventory.Secondary.Value = false;
        p.Inventory.Explosive.Value = false;
        p.contextedProperties.MaxHp.Value = 100;
        p.Spawns.Despawn();
    }
});

// Зоны
function t_HintReset(p, a) {
    p.Ui.Hint.Reset();
}

JQUtils.CreateArea({
    name: "main", tags: ["main"], color: ColorsLib.Colors.Crimson, enter: function (p, a) {
        if (State.Value != STATES.Preround) return;
        let prop = p.Properties.Get(`${a.Name}_accept`);
        if (p.Inventory.Main.Value) return p.Ui.Hint.Value = "Основное оружие уже куплено";
        if (prop.Value) {
            if (p.Properties.Scores.Value >= MAIN_COST) {
                p.Properties.Scores.Value -= MAIN_COST;
                p.Ui.Hint.Value = "Вы купили основное оружие";
                p.Inventory.Main.Value = true;
            } else {
                p.Ui.Hint.Value = `Недостаточно денег. Нужно еще ${MAIN_COST - p.Properties.Scores.Value}`;
            }
            return prop.Value = false;
        } else {
            p.Ui.Hint.Value = `Вы хотите купить основное оружие за ${MAIN_COST}\nВойдите в зону второй раз чтобы купить`;
            return prop.Value = true;
        }
    }, exit: t_HintReset
});

JQUtils.CreateArea({
    name: "secondary", tags: ["secondary"], color: ColorsLib.Colors.DarkKhaki, enter: function (p, a) {
        if (State.Value != STATES.Preround) return;
        let prop = p.Properties.Get(`${a.Name}_accept`);
        if (p.Inventory.Secondary.Value) return p.Ui.Hint.Value = "Вторичное оружие уже куплено";
        if (prop.Value) {
            if (p.Properties.Scores.Value >= SECONDARY_COST) {
                p.Properties.Scores.Value -= SECONDARY_COST;
                p.Ui.Hint.Value = "Вы купили вторичное оружие";
                p.Inventory.Secondary.Value = true;
            } else {
                p.Ui.Hint.Value = `Недостаточно денег. Нужно еще ${SECONDARY_COST - p.Properties.Scores.Value}`;
            }
            return prop.Value = false;
        } else {
            p.Ui.Hint.Value = `Вы хотите купить вторичное оружие за ${SECONDARY_COST}\nВойдите в зону второй раз чтобы купить`;
            return prop.Value = true;
        }
    }, exit: t_HintReset
});

JQUtils.CreateArea({
    name: "explosive", tags: ["explosive"], color: ColorsLib.Colors.Aquamarine, enter: function (p, a) {
        if (State.Value != STATES.Preround) return;
        let prop = p.Properties.Get(`${a.Name}_accept`);
        if (p.Inventory.Explosive.Value) return p.Ui.Hint.Value = "Взрывчатка уже куплена";
        if (prop.Value) {
            if (p.Properties.Scores.Value >= EXPLOSIVE_COST) {
                p.Properties.Scores.Value -= EXPLOSIVE_COST;
                p.Ui.Hint.Value = "Вы купили взрывчатку";
                p.Inventory.Explosive.Value = true;
            } else {
                p.Ui.Hint.Value = `Недостаточно денег. Нужно еще ${EXPLOSIVE_COST - p.Properties.Scores.Value}`;
            }
            return prop.Value = false;
        } else {
            p.Ui.Hint.Value = `Вы хотите купить взрывчатку за ${EXPLOSIVE_COST}\nВойдите в зону второй раз чтобы купить`;
            return prop.Value = true;
        }
    }, exit: t_HintReset
});

JQUtils.CreateArea({
    name: "defkit", tags: ["defkit"], color: ColorsLib.Colors.Plum, enter: function (p, a) {
        if (State.Value != STATES.Preround) return;
        let prop = p.Properties.Get(`${a.Name}_accept`);
        if (p.Properties.Get("defkit").Value == ENABLED) return p.Ui.Hint.Value = "Набор сапера уже куплен";
        if (prop.Value) {
            if (p.Properties.Scores.Value >= DEFUSEKIT_COST) {
                p.Properties.Scores.Value -= DEFUSEKIT_COST;
                p.Ui.Hint.Value = "Вы купили набор сапера";
                p.Properties.Get("defkit").Value = ENABLED
            } else {
                p.Ui.Hint.Value = `Недостаточно денег. Нужно еще ${DEFUSEKIT_COST - p.Properties.Scores.Value}`;
            }
            return prop.Value = false;
        } else {
            p.Ui.Hint.Value = `Вы хотите купить набор сапера за ${DEFUSEKIT_COST}\nВойдите в зону второй раз чтобы купить`;
            return prop.Value = true;
        }
    }, exit: t_HintReset
});

JQUtils.CreateArea({
    name: "helmet", tags: ["helmet"], color: ColorsLib.Colors.SteelBlue, enter: function (p, a) {
        if (State.Value != STATES.Preround) return;
        let prop = p.Properties.Get(`${a.Name}_accept`);
        if (p.contextedProperties.MaxHp.Value >= HELMET_HP) return p.Ui.Hint.Value = "Шлем уже куплен";
        if (prop.Value) {
            if (p.Properties.Scores.Value >= HELMET_COST) {
                p.Properties.Scores.Value -= HELMET_COST;
                p.Ui.Hint.Value = "Вы купили шлем";
                p.contextedProperties.MaxHp.Value = HELMET_HP;
                p.Spawns.Spawn();
            } else {
                p.Ui.Hint.Value = `Недостаточно денег. Нужно еще ${HELMET_COST - p.Properties.Scores.Value}`;
            }
            return prop.Value = false;
        } else {
            p.Ui.Hint.Value = `Вы хотите купить шлем (130 хп) за ${HELMET_COST}\nВойдите в зону второй раз чтобы купить`;
            return prop.Value = true;
        }
    }, exit: t_HintReset
});

JQUtils.CreateArea({
    name: "armour", tags: ["armour"], color: ColorsLib.Colors.BlueViolet, enter: function (p, a) {
        if (State.Value != STATES.Preround) return;
        let prop = p.Properties.Get(`${a.Name}_accept`);
        if (p.contextedProperties.MaxHp.Value >= VEST_HP) return p.Ui.Hint.Value = "Бронежилет и шлем уже куплены";
        if (prop.Value) {
            if (p.Properties.Scores.Value >= VEST_COST) {
                p.Properties.Scores.Value -= VEST_COST;
                p.Ui.Hint.Value = "Вы купили бронежилет и шлем";
                p.contextedProperties.MaxHp.Value = VEST_HP;
                p.Spawns.Spawn();
            } else {
                p.Ui.Hint.Value = "Недостаточно денег. Нужно еще " + (VEST_COST - p.Properties.Scores.Value);
            }
            return prop.Value = false;
        } else {
            p.Ui.Hint.Value = "Вы хотите купить бронежилет и шлем (+" + VEST_HP + ") за " + VEST_COST + ".\nВойдите в зону второй раз чтобы купить";
            return prop.Value = true;
        }
    }, exit: t_HintReset
});

JQUtils.CreateArea({
    name: "bomb", tags: ["bomb"], color: ColorsLib.Colors.Plum, enter: function (p, a) {
        if (p.Team == CounterTerrorists) return;
        if (Bomb.Value) {
            if (p.Properties.Get("bomb").Value) return p.Ui.Hint.Value = "Бомба уже положена";
            p.Properties.Get("bomb").Value = ENABLED;
            Bomb.Value = false;
            p.Ui.Hint.Value = "Вы взяли бомбу";
        }
        else {
            if (p.Properties.Get("bomb").Value) {
                p.Properties.Get("bomb").Value = EMPTY;
                Bomb.Value = true;
                p.Ui.Hint.Value = "Вы положили бомбу";
            }
            p.Ui.Hint.Value = "Бомбы нету!";
        }
    }, exit: t_HintReset
});

let plant = JQUtils.CreateArea({
    name: "plant", tags: ["_plant"], color: ColorsLib.Colors.Green, view: false, enter: function (p, a) {
        if (!IsPlanted.Value && p.Team == Terrorists) {
            if (State.Value != STATES.Round) return p.Ui.Hint.Value = "Место закладки бомбы";
            if (p.Properties.Get("bomb").Value != ENABLED) return p.Ui.Hint.Value = "У вас нет бомбы.";
            p.Ui.Hint.Value = "Ждите " + BOMB_PLANTING_TIME + "сек. в зоне чтобы заложить бомбу";
            return p.Timers.Get("plant" + a.Name).Restart(BOMB_PLANTING_TIME);
        }
        if (IsPlanted.Value && p.Team == CounterTerrorists && API.AreaViewService.GetContext().Get(a.Name).Color.r > 0) {
            if (State.Value != STATES.Round) return p.Ui.Hint.Value = "Место разминирования бомбы";
            let def_time = p.Properties.Get("defkit").Value ? BOMB_DEFUSEKIT_TIME : BOMB_DEFUSE_TIME;
            p.Ui.Hint.Value = "Ждите " + def_time + "сек. чтобы разминировать бомбу";
            p.Timers.Get("defuse" + a.Name).Restart(def_time);
        }
    }, exit: function (p, a) {
        p.Timers.Get("defuse" + a.Name).Stop();
        p.Timers.Get("plant" + a.Name).Stop();
        t_HintReset(p, a);
    }
});

// Таймеры
MainTimer.OnTimer.Add(function () {
    switch (State.Value) {
        case STATES.Waiting:
            StartWarmup();
            break;
        case STATES.Warmup:
            WaitingRound();
            break;
        case STATES.Preround:
            StartRound();
            break;
        case STATES.Round:
            if (IsPlanted.Value) EndRound(Terrorists);
            else EndRound(CounterTerrorists);
            break;
        case STATES.Endround:
            if (Round.Value == ROUNDS / 2 && !Properties.Get("teams_changed").Value) {
                MainTimer.Restart(3);
                TeamChange();
                Properties.Get("teams_changed").Value = true;
                break;
            }
            WaitingRound();
            break
        case STATES.Endgame:
            State.Value = STATES.Clearing;
            API.Players.All.forEach((p) => { p.Properties.GetProperties().forEach((prop) => { prop.Value = null; }); });
            MainTimer.Restart(10);
            break;
        case "clearing":
            Game.RestartGame();
            break;
    }
});

API.Timers.OnPlayerTimer.Add(function (timer) {
    if (timer.Id == "clear") return timer.Player.Ui.Hint.Reset();
    if (!timer.Player.IsAlive) return;
    if (timer.Id.slice(0, 5) == "plant") {
        const area_name = timer.Id.replace("plant", "");
        if (API.AreaViewService.GetContext().Get(area_name).Color.r > 0 || IsPlanted.Value || State.Value != STATES.Round) return;
        Ui.Hint.Value = "Бомба заложена. Спецназ должен разминировать красную зону.";
        IsPlanted.Value = true;
        MainTimer.Restart(BEFORE_PLANTING_TIME);
        timer.Player.Properties.Scores.Value += BOUNTY_PLANT;
        timer.Player.Properties.Get("bomb").Value = EMPTY;
        API.AreaViewService.GetContext().Get(area_name).Color = ColorsLib.Colors.Crimson;
    }
    if (timer.Id.slice(0, 6) == "defuse") {
        const area_name = timer.Id.replace("defuse", "");
        if (API.AreaViewService.GetContext().Get(area_name).Color.r == 0 || State.Value != STATES.Round) return;
        IsPlanted.Value = false;
        timer.Player.Properties.Scores.Value += BOUNTY_DEFUSE;
        API.AreaViewService.GetContext().Get(area_name).Color = ColorsLib.Colors.Green;
        EndRound(CounterTerrorists);
    }
});


// Функции
function GetRandom(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function AnotherTeam(t) {
    if (t == Terrorists) return CounterTerrorists;
    else return Terrorists;
}

function JoinToTeam(p, t)
{
    let CT_Count = CounterTerrorists.Count - (p.Team == CounterTerrorists ? 1 : 0),
        T_Count = Terrorists.Count - (p.Team == Terrorists ? 1 : 0);
    if (CT_Count != T_Count) {
        if (CT_Count < T_Count) CounterTerrorists.Add(p);
        else if (CT_Count > T_Count) Terrorists.Add(p);
    }
    else t.Add(p);
}

function AreasEnable(v) {
    API.AreaViewService.GetContext().Get("main").Enable = v;
    API.AreaViewService.GetContext().Get("secondary").Enable = v;
    API.AreaViewService.GetContext().Get("explosive").Enable = v;
    API.AreaViewService.GetContext().Get("defkit").Enable = v;
    API.AreaViewService.GetContext().Get("armour").Enable = v;
    API.AreaViewService.GetContext().Get("helmet").Enable = v;
}
    

function BanPlayer(p) {
    p.Spawns.Spawn();
    p.Spawns.Despawn();
    p.Properties.Get("banned").Value = true;
    p.PopUp("<size=45><B>Вы забанены!</B></size>\n<i>Считаете, что забанены не по делу? Пишите в Issue в репозитории на GitHub.</i>");
}

function GetAlivePlayersCount(t) {
    let count = 0;
    API.Players.All.forEach((p) => { if (p.Team == t && p.Spawns.IsSpawned && p.IsAlive && !p.Properties.Get("banned").Value) count++; });
    return count;
}

function SpawnPlayers(clear) {
    API.Spawns.GetContext().Enable = true;
    API.Spawns.GetContext().RespawnEnable = true;
    API.Players.All.forEach((p) => {
        if (p.Team != null && !p.Properties.Get("banned").Value && p.Properties.Get("isconnected").Value == null) {
            p.Properties.Get("isconnected").Value = null;
            p.Spawns.Spawn();
        }
    });
}

function BalanceTeams() {
    let CT_Players = CounterTerrorists.Players, T_Players = Terrorists.Players;
  
    while (CT_Players.length - 1 > T_Players.length) {
        Terrorists.Add(CT_Players[CT_Players.length - 1]);
    }

    while (T_Players.length - 1 > CT_Players.length) {
        CounterTerrorists.Add(T_Players[T_Players.length - 1]);
    }
}

function AddBombToRandom() {
    if (Terrorists.Count == 0) return;
    let T_Players = Terrorists.Players;
    let countplr = Math.round(T_Players.length / 2);
    if (countplr < 1) countplr = 1;
    for (let i = 0; i < countplr; i++) {
        let p = API.Players.GetByRoomId(T_Players[GetRandom(0, T_Players.length - 1)].IdInRoom);
        p.Properties.Get("bomb").Value = ENABLED;
        p.Ui.Hint.Value = "Вы получили бомбу!";
        p.Timers.Get("clear").Restart(15);
    }
}

StartGame();
function StartGame() {
    API.Spawns.GetContext().RespawnEnable = false;
    Ui.Hint.Value = "Загрузка режима";
    API.Players.All.forEach((p) => {
        if (Blacklist.Value.search(p.Id) != -1) BanPlayer(p);
    });
    MainTimer.Restart(LOADING_TIME);
}

function StartWarmup() {
    State.Value = STATES.Warmup;
    API.AreaService.GetByTag("plant").forEach((a) => {
        a.Ranges.All.forEach((range) => {
            const letters = "qwertyuiopasdfghjklzxcvbnmm1234567890";
            let rnd_name = "";
            for (let i = 0; i < 6; i++) {
                rnd_name += letters[GetRandom(0, letters.length - 1)];
            }
            let rnd = API.AreaService.Get(rnd_name);
            rnd.Tags.Add("_plant");
            API.AreaViewService.GetContext().Get(rnd_name).Color = ColorsLib.Colors.Green;
            API.AreaViewService.GetContext().Get(rnd_name).Area = rnd;
            API.AreaViewService.GetContext().Get(rnd_name).Enable = true;
            rnd.Ranges.Add(new Basic.IndexRange(range.Start.x, range.Start.y, range.Start.z, range.End.x, range.End.y, range.End.z));
        })
        a.Tags.Clear();
        a.Ranges.Clear();
    });
    API.Damage.GetContext().DamageIn.Value = true;
    API.Spawns.GetContext().RespawnEnable = true;
    SpawnPlayers();
    API.room.PopUp("<B>Закладка бомбы от just_qstn\n<size=50><i>Разминка\n\n\n</i></size><size=30>Запрещенные оружия: Катана, СВД, ВСС, РПГ, Мак-11 (пистолет), РПК-74.\n<color=red>ИСПОЛЬЗОВАНИЕ ЗАПРЕЩЕННЫХ ОРУЖИЙ КАРАЕТСЯ БАНОМ!</color></size></B>");
    MainTimer.Restart(WARMUP_TIME);
}

function WaitingRound() {
    State.Value = STATES.Preround;

    API.MapEditor.SetBlock(API.AreaService.Get("bd"), 93);
    API.MapEditor.SetBlock(API.AreaService.Get("bd"), 93);

    BalanceTeams();

    API.Damage.GetContext().DamageIn.Value = false;
    Ui.Hint.Value = `Закупка снаряжения.\nРаунд ${(Round.Value + 1)}/${ROUNDS}`;
    API.room.PopUp("<B>Закладка бомбы от just_qstn\n<size=50><i>Покупайте снаряжение в зонах\n\n\n</i></size><size=30>Запрещенные оружия: Катана, СВД, ВСС, РПГ, Мак-11 (пистолет), РПК-74.\n<color=red>ИСПОЛЬЗОВАНИЕ ЗАПРЕЩЕННЫХ ОРУЖИЙ КАРАЕТСЯ БАНОМ!</color></size></B>");

    AreasEnable(true);

    API.Inventory.GetContext().Main.Value = false;
    API.Inventory.GetContext().Secondary.Value = false;
    API.Inventory.GetContext().Explosive.Value = false;

    Bomb.Value = false;

    const areas = API.AreaService.GetByTag("_plant");
    for (let i = 0; i < areas.length; i++) {
        API.AreaViewService.GetContext().Get(areas[i].Name).Color = ColorsLib.Colors.Green;
    }

    MainTimer.Restart(PRE_ROUND_TIME);

    SpawnPlayers();
    AddBombToRandom();

}

function StartRound() {
    Terrorists.Properties.Get("hint").Value = `< Победы: ${Terrorists.Properties.Get("wins").Value} >\n\n< Живых: ${(GetAlivePlayersCount(Terrorists))} >`;
    CounterTerrorists.Properties.Get("hint").Value = "< Победы: " + CounterTerrorists.Properties.Get("wins").Value + " >\n\n< Живых: " + (GetAlivePlayersCount(CounterTerrorists) || "-") + " >";

    AreasEnable(false);

    API.Damage.GetContext().DamageIn.Value = true;
    State.Value = STATES.Round;
    API.Spawns.GetContext().RespawnEnable = false;

    Ui.Hint.Value = `Закладка бомбы.\nРаунд ${(Round.Value + 1)}/${ROUNDS}`;
    MainTimer.Restart(ROUND_TIME);

    API.MapEditor.SetBlock(API.AreaService.Get("bd"), 0);
    API.MapEditor.SetBlock(API.AreaService.Get("bd"), 0);
}

function EndRound(t) {
    JQUtils.pcall(() => {
        State.Value = STATES.Endround;
        API.Damage.GetContext().DamageIn.Value = false;
        Properties.Get("addedBomb").Value = false;
        IsPlanted.Value = false;
        MainTimer.Restart(AFTER_ROUND_TIME);
        let aTeam = AnotherTeam(t);
        Round.Value++;
        Ui.Hint.Value = t == CounterTerrorists ? "В раунде победил спецназ" : "В раунде победили террористы";
        API.room.PopUp(`<B>Закладка бомбы от just_qstn\n<size=50><i>${Ui.Hint.Value}</i></B>`);
        API.Players.All.forEach((p) => {
            p.Properties.Scores.Value += p.Team == t ? BOUNTY_WIN : BOUNTY_LOSE + (BOUNTY_LOSE_BONUS * aTeam.Properties.Get("loses").Value);
        })
        t.Properties.Get("wins").Value++;
        t.Properties.Get("loses").Value = Math.round(t.Properties.Get("loses").Value / 2);
        if (t.Properties.Get("loses").Value < 1) t.Properties.Get("loses").Value = 0;
        if (aTeam.Properties.Get("loses").Value < MAX_LOSS_BONUS) aTeam.Properties.Get("loses").Value++;

        if (t.Properties.Get("wins").Value > ROUNDS / 2) return EndGame();
        if (Round.Value >= ROUNDS && CounterTerrorists.Properties.Get("wins").Value != Terrorists.Properties.Get("wins").Value) JQUtils.SetTimeout(EndGame, 10);
    }, true)
}

function EndGame() {
    const Winner = CounterTerrorists.Properties.Get("wins").Value > Terrorists.Properties.Get("wins").Value ? CounterTerrorists : Terrorists;
    API.room.PopUp(`<B>Закладка бомбы от just_qstn\n<size=50><i>Победили ${Winner == CounterTerrorists ? "Победил спецназ" : "Победили террористы"}</i></B>`);
    Game.GameOver(Winner);
    State.Value = STATES.Endgame;
    MainTimer.Restart(END_TIME);
}
