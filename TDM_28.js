// КОНСТАНТЫ
const DefaultMoney = 800; // деньги при спавне
const DefaultBountyForKill = 150; // деньги за убийство
const DefaultBountyForWin = 1800; // деньги за победу
const DefaultBountyForPlant = 300; // деньги за плент
const DefaultBountyForDefuse = 500; // деньги за дефьюз
const DefaultBountyForLose = 1200; // деньги за проигрыш
const DefaultBonusForLose = 500 // каждый раз после проигрыша эта сумма прибавляется к DefaultBountyForLose и умножается на количество поражений
const Rounds = 10; // количество раундов (всегда нечетное количество)
const LoadTime = 10; // время загрузки 
const WarmupTime = 60; // время разминки
const RoundTime = 150; // время раунда
const AfterRoundTime = 10; // время после раунда
const PreRoundTime = 30; // время перед раундом
const PlantTime = 3; // время плента бомбы
const DefaultDefuseTime = 8; // время разминирования бомбы без набора сапера
const BombTime = 60; // время после закладки бомбы
const MainCost = 2750; // цена на основное оружие
const SecondaryCost = 600; // цена на вторичное оружие
const ExplosiveCost = 500; // цена на взрывчатку
const DefkitCost = 300; // цена на набор сапера
const ArmourCost = 1000; // цена на броню
const MaxMoney = 5000; // максимальное количество денег

const banned = "95287830CF069FE5"; // забаненные игроки
 
// ПЕРЕМЕННЫЕ
var mainTimer = Timers.GetContext().Get("main");
var infTimer = Timers.GetContext().Get("inf");
var state = Properties.GetContext().Get("state");
var rounds = Properties.GetContext().Get("rounds");
var plant = Properties.GetContext().Get("plant");
rounds.Value = 1;
plant.Value = false;

// РАЗРЕШЕНИЯ И НАСТРОЙКИ
TeamsBalancer.IsAutoBalance = true;
Damage.GetContext().GranadeTouchExplosion.Value = false;
BreackGraph.Damage = false;

// СОЗДАНИЕ КОМАНД
Teams.Add("t", "<i><B><size=38>Т</size><size=30>еррористы</size></B>\nзакладка бомбы от just_qstn</i>", toFixedRGB(210, 150, 70));
Teams.Add("ct", "<i><B><size=38>С</size><size=30>пецназ</size></B>\nзакладка бомбы от just_qstn</i>", toFixedRGB(70, 145, 210));
var tTeam = Teams.Get("t");
var ctTeam = Teams.Get("ct");
tTeam.Spawns.SpawnPointsGroups.Add(2);
ctTeam.Spawns.SpawnPointsGroups.Add(1);

// ЛИДЕРБОРД
LeaderBoard.PlayerLeaderBoardValues = [
    {
        Value: "Kills",
        DisplayName: "<B>Убийства</B>",
        ShortDisplayName: "<B>Убийства</B>"
    },
    {
        Value: "Deaths",
        DisplayName: "<B>Смерти</B>",
        ShortDisplayName: "<B>Смерти</B>"
    },
    {
        Value: "Scores",
        DisplayName: "<B>Деньги</B>",
        ShortDisplayName: "<B>Деньги</B>"
    },
    {
        Value: "bomb",
        DisplayName: "<B>Бомба</B>",
        ShortDisplayName: "<B>Бомба</B>"
    },
    {
        Value: "defkit",
        DisplayName: "<B>Сапер</B>",
        ShortDisplayName: "<B>Сапер</B>"
    }
];
LeaderBoard.PlayersWeightGetter.Set(function (p) {
    return p.Properties.Get("Kills").Value;
});

// ИНТЕРФЕЙС
Ui.GetContext().TeamProp1.Value = {
    Team: "t", Prop: "wins"
};

Ui.GetContext().TeamProp2.Value = {
    Team: "ct", Prop: "wins"
};

Ui.GetContext().MainTimerId.Value = mainTimer.Id;
const WaterMark = " - Режим от just_qstn"

// СОБЫТИЯ
Teams.OnRequestJoinTeam.Add(function (p, team) {
    if (p.Team == null) {
        if (p.Id == banned) {
            p.Spawns.Despawn();
            p.Spawn.Enable = false;
            p.Properties.Get("banned").Value = true;
            return p.Ui.Hint.Value = "Вы забанены";
        }
        p.Properties.Scores.Value = DefaultMoney;
        p.Properties.Get("bomb").Value = false;
        p.Properties.Get("defkit").Value = false;
        p.Properties.Get("isDead").Value = false;
        p.Properties.Get("banned").Value = false;
    }
    if (!p.Properties.Get("banned").Value) team.Add(p);
});

Teams.OnPlayerChangeTeam.Add(function (p) {
    if (state.Value != "Round" && state.Value != "EndRound" && state.Value != "Loading") p.Spawns.Spawn();
});

Players.OnPlayerDisconnected.Add(function (p) {
    if (state.Value != "Round") return;
    if (tTeam.GetAlivePlayersCount() <= 0) EndRound(ctTeam);
    if (ctTeam.GetAlivePlayersCount() <= 0) EndRound(tTeam);
});

Damage.OnDeath.Add(function (p) {
    if (state.Value == "Warmup") return;
    ++p.Properties.Deaths.Value;
    p.Properties.Get("defkit").Value = false;
    p.Properties.Get("bomb").Value = false;
    if (p.Properties.Get("bomb").Value) {
        Ui.GetContext().Hint.Value = "Игрок с бомбой умер, бомба возвращена на спавн террористов";
        Properties.GetContext().Get("bomb").Value = true;
    }
    if (state.Value == "Warmup") return;
    p.Inventory.Main.Value = false;
    p.Inventory.Secondary.Value = false;
    p.Inventory.Explosive.Value = false;
	p.contextedProperties.MaxHp.Value = 100;
});

Damage.OnKill.Add(function (p, killed) {
    if (killed.Team != null && killed.Team != p.Team && state.Value != "Warmup") {
        ++p.Properties.Kills.Value;
        p.Properties.Scores.Value += DefaultBountyForKill;
    }
});


Properties.OnPlayerProperty.Add(function (context, value) {
    if (value.Name == "Deaths" && !plant.Value && context.Player.Team.GetAlivePlayersCount() <= 0) EndRound(anotherTeam(context.Player.Team));
    if (context.Player.Team == ctTeam && value.Name == "Deaths" && plant.Value && context.Player.Team.GetAlivePlayersCount() <= 0) EndRound(tTeam);
    if (context.Player.Properties.Scores.Value >= (MaxMoney + 1)) context.Player.Properties.Scores.Value = MaxMoney;
});

// ЗОНЫ
const main = AreaPlayerTriggerService.Get("main");
const secondary = AreaPlayerTriggerService.Get("secondary");
const explosive = AreaPlayerTriggerService.Get("explosive");
const bomb = AreaPlayerTriggerService.Get("bomb");
const defkit = AreaPlayerTriggerService.Get("defkit");
const defuse = AreaPlayerTriggerService.Get("defuse");
const iplant = AreaPlayerTriggerService.Get("plant");
const armour = AreaPlayerTriggerService.Get("armour");

main.OnEnter.Add(function (p, area) {
    if (state.Value != "Waiting") return;
    var prop = p.Properties.Get("apply" + area.Name);
    switch (prop.Value) {
        case true:
            if (p.Properties.Scores.Value >= MainCost) {
                p.Properties.Scores.Value -= MainCost;
                p.Inventory.Main.Value = true;
                p.Ui.Hint.Value = "Вы купили основное оружие";
            }
            else p.Ui.Hint.Value = "Недостаточно денег";
            prop.Value = false;
            break;
        case null:
            p.Ui.Hint.Value = "Вы хотите купить основное оружие за " + MainCost + ". Войдите в зону еще раз, чтобы купить";
            prop.Value = true;
            break;
        case false:
            p.Ui.Hint.Value = "Вы хотите купить основное оружие за " + MainCost + ". Войдите в зону еще раз, чтобы купить";
            prop.Value = true;
            break;
    }
});

main.OnExit.Add(function(p) { p.Ui.Hint.Reset(); });

secondary.OnEnter.Add(function (p, area) {
    if (state.Value != "Waiting") return;
    var prop = p.Properties.Get("apply" + area.Name);
    switch (prop.Value) {
        case true:
            if (p.Properties.Scores.Value >= SecondaryCost) {
                p.Properties.Scores.Value -= SecondaryCost;
                p.Inventory.Secondary.Value = true;
                p.Ui.Hint.Value = "Вы купили вторичное оружие";
            }
            else p.Ui.Hint.Value = "Недостаточно денег";
            prop.Value = false;
            break;
        case null:
            p.Ui.Hint.Value = "Вы хотите купить вторичное оружие за " + SecondaryCost  + ". Войдите в зону еще раз, чтобы купить";
            prop.Value = true;
            break;
        case false:
            p.Ui.Hint.Value = "Вы хотите купить вторичное оружие за " + SecondaryCost + ". Войдите в зону еще раз, чтобы купить";
            prop.Value = true;
            break;
    }
});

secondary.OnExit.Add(function(p) { p.Ui.Hint.Reset(); });

explosive.OnEnter.Add(function (p, area) {
    if (state.Value != "Waiting") return;
    var prop = p.Properties.Get("apply" + area.Name);
    switch (prop.Value) {
        case true:
            if (p.Properties.Scores.Value >= ExplosiveCost) {
                p.Properties.Scores.Value -= ExplosiveCost;
                p.Inventory.Explosive.Value = true;
                p.Ui.Hint.Value = "Вы купили взрывчатку";
            }
            else p.Ui.Hint.Value = "Недостаточно денег";
            prop.Value = false;
        case null:
            p.Ui.Hint.Value = "Вы хотите купить гранату за " + ExplosiveCost + ". Войдите в зону еще раз, чтобы купить";
            prop.Value = true;
            break;
        case false:
            p.Ui.Hint.Value = "Вы хотите купить гранату за " + ExplosiveCost  + ". Войдите в зону еще раз, чтобы купить"; 
            prop.Value = true;
            break;
    }
});

explosive.OnExit.Add(function(p) { p.Ui.Hint.Reset(); });

armour.OnEnter.Add(function (p, area) {
    if (state.Value != "Waiting") return;
    var prop = p.Properties.Get("apply" + area.Name);
    switch (prop.Value) {
        case true:
            if (p.Properties.Scores.Value >= ArmourCost) {
                p.Properties.Scores.Value -= ArmourCost;
                p.contextedProperties.MaxHp.Value = 175;
				p.Spawns.Spawn();
                p.Ui.Hint.Value = "Вы купили броню";
            }
            else p.Ui.Hint.Value = "Недостаточно денег";
            prop.Value = false;
        case null:
            p.Ui.Hint.Value = "Вы хотите купить броню за " + ArmourCost + ". Войдите в зону еще раз, чтобы купить";
            prop.Value = true;
            break;
        case false:
            p.Ui.Hint.Value = "Вы хотите купить броню за " + ArmourCost + ". Войдите в зону еще раз, чтобы купить"; 
            prop.Value = true;
            break;
    }
});

armour.OnExit.Add(function(p) { p.Ui.Hint.Reset(); });

bomb.OnEnter.Add(function (p, area) {
    if (p.Team != tTeam) return;
    var prop = Properties.GetContext().Get("bomb");
    if (!p.Properties.Get("bomb").Value && !prop.Value) return p.Ui.Hint.Value = "Вы не можете положить бомбу, у вас ее нету";
    if (p.Properties.Get("bomb").Value && !prop.Value) {
        prop.Value = true;
        p.Properties.Get("bomb").Value = false;
        return p.Ui.Hint.Value = "Вы положили бомбу";
    }
    else {
        prop.Value = false;
        p.Properties.Get("bomb").Value = true;
        return p.Ui.Hint.Value = "Вы взяли бомбу";
    }
});

bomb.OnExit.Add(function(p) { p.Ui.Hint.Reset(); });

defkit.OnEnter.Add(function (p, area) {
    if (state.Value != "Waiting") return;
    var prop = p.Properties.Get("apply" + area.Name);
    switch (prop.Value) {
        case true:
            if (p.Properties.Scores.Value >= DefkitCost) {
                p.Properties.Scores.Value -= DefkitCost;
                p.Properties.Get("defkit").Value = true;
                p.Ui.Hint.Value = "Вы купили набор сапера";
            }
            else p.Ui.Hint.Value = "Недостаточно денег";
            prop.Value = false;
            break;
        case null:
            p.Ui.Hint.Value = "Вы хотите купить набор сапера за " + DefkitCost + ". Войдите в зону еще раз, чтобы купить";
            prop.Value = true;
            break;
        case false:
            p.Ui.Hint.Value = "Вы хотите купить набор сапера за " + DefkitCost + ". Войдите в зону еще раз, чтобы купить"; 
            prop.Value = true;
            break;
    }
});

defkit.OnExit.Add(function(p) { p.Ui.Hint.Reset(); });

iplant.OnEnter.Add(function (p, area) {
    if (!plant.Value && p.Team == tTeam) {
        if (state.Value != "Round") return p.Ui.Hint.Value = "Место закладки бомбы";
        if (!p.Properties.Get("bomb").Value) return p.Ui.Hint.Value = "У вас нет бомбы. Ее можно купить перед раундом";
        p.Ui.Hint.Value = "Ждите 3 секунд в зоне чтобы заложить бомбу";
        p.Timers.Get("plant" + area.Name).Restart(PlantTime);
    }
});

iplant.OnExit.Add(function (p, area) {
    if (p.Team == tTeam) {
        p.Ui.Hint.Reset();
        p.Timers.Get("plant" + area.Name).Stop();
    }
});

defuse.OnEnter.Add(function (p, area) {
    if (p.Team == ctTeam) {
        p.Ui.Hint.Value = p.Properties.Get("defkit").Value ? "Ждите 5 секунд чтобы разминировать бомбу" : "Ждите 8 секунд чтобы разминировать бомбу";
        var defTime = DefaultDefuseTime;
        if (p.Properties.Get("defkit").Value) defTime = 5;
        p.Timers.Get("defuse" + area.Name).Restart(defTime);
    }
});

defuse.OnExit.Add(function (p, area) {
    if (p.Team == ctTeam) {
        p.Ui.Hint.Reset();
        p.Timers.Get("defuse" + area.Name).Stop();
    }
});

// ТАЙМЕРЫ
Timers.OnPlayerTimer.Add(function (timer) {
    if (timer.Id.slice(0, 5) == "plant") {
        const area = AreaService.Get(timer.Id.slice(5));
        if (area.Tags.Contains("defuse") || plant.Value || state.Value != "Round") return;
        Ui.GetContext().Hint.Value = "Бомба заложена. Спецназ должен разминировать красную зону.";
        plant.Value = true;
        mainTimer.Restart(BombTime);
        timer.Player.Properties.Scores.Value += DefaultBountyForPlant;
        timer.Player.Properties.Get("bomb").Value = false;
        area.Tags.Remove("_plant");
        area.Tags.Add("defuse");
    }
    if (timer.Id.slice(0, 6) == "defuse") {
        const area = AreaService.Get(timer.Id.slice(6));
        if (area.Tags.Contains("_plant") || state.Value != "Round") return;
        plant.Value = false;
        timer.Player.Properties.Scores.Value += DefaultBountyForDefuse;
        area.Tags.Remove("defuse");
        area.Tags.Add("_plant");
        EndRound(ctTeam);
    }
});

infTimer.OnTimer.Add(function () {
    if (state.Value != "Waiting") return infTimer.Stop();
    infTimer.Restart(1);
    var e = Players.GetEnumerator();
    while (e.moveNext()) {
        if (!spawn.Contains(e.Current) && !e.Current.Spawns.IsSpawned && e.Current.Team != null) e.Current.Spawns.Spawn();
    }
});

mainTimer.OnTimer.Add(function () {
    switch (state.Value) {
        case "Loading":
            StartWarmup();
            break;
        case "Warmup":
            WaitingRound();
            break;
        case "Waiting":
            StartRound();
            break;
        case "Round":
            if (plant.Value) EndRound(tTeam);
            else EndRound(ctTeam);
            break
        case "EndRound":
            if (!plant.Value) WaitingRound();
            break
        case "EndGame":
            Game.RestartGame();
            break;
    }
});

// ФУНКЦИИ
function GetRandom(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function toFixedRGB(red, green, blue) {
    return { r: Math.round((red / 255) * 100) / 100, b: Math.round((blue / 255) * 100) / 100, g: Math.round((green / 255) * 100) / 100 };
}

function AddBombToRandom() {
	try {
		var plrs = [];
		var e = Players.GetEnumerator();
		while (e.moveNext()) {
			if (e.Current.Team == tTeam) plrs.push(e.Current.IdInRoom);
		}
		var countplr = Math.round(tTeam.Count / 2);
		if (countplr < 1) countplr = 1;
		for (var i = 0; i < countplr; i++) {
			var p = Players.GetByRoomId(plrs[GetRandom(0, plrs.length - 1)]);
			p.Properties.Get("bomb").Value = true;
			p.Ui.Hint.Value = "Вы получили бомбу!";
			Properties.GetContext().Get("addedBomb").Value = true;
		}
	} catch (e) { msg.Show(e.name + " " + e.message); }
}

function AddArea(tag, name, color, enableView, enableTrigger) {
    const areaView = AreaViewService.GetContext().Get(name);
    areaView.Color = color;
    areaView.Tags = tag;
    areaView.Enable = enableView || true;
    const areaTrigger = AreaPlayerTriggerService.Get(name);
    areaTrigger.Tags = tag;
    areaTrigger.Enable = enableTrigger || true;
}

function InitTeams() {
    var e = Teams.GetEnumerator();
    while (e.moveNext()) {
        Properties.GetContext(e.Current).Get("wins").Value = 0;
        Properties.GetContext(e.Current).Get("loses").Value = 1;
    }
}

function InitAreas() {
    AddArea(["main"], "main", toFixedRGB(255, 32, 0));
    AddArea(["secondary"], "secondary", toFixedRGB(255, 255, 0));
    AddArea(["explosive"], "explosive", toFixedRGB(0, 255, 179));
    AddArea(["bomb"], "bomb", toFixedRGB(255, 0, 255));
    AddArea(["defkit"], "defkit", toFixedRGB(255, 0, 255));
    AddArea(["armour"], "armour", toFixedRGB(128, 96, 255));

    AddArea(["_plant"], "plant", toFixedRGB(0, 255, 0));
    AddArea(["defuse"], "defuse", toFixedRGB(255, 0, 0));
}

function AreasEnable(value) {
    AreaViewService.GetContext().Get("main").Enable = value;
    AreaViewService.GetContext().Get("secondary").Enable = value;
    AreaViewService.GetContext().Get("explosive").Enable = value;
    AreaViewService.GetContext().Get("defkit").Enable = value;
    AreaViewService.GetContext().Get("spawn").Enable = value;
    AreaViewService.GetContext().Get("armour").Enable = value;
}

function SpawnTeams() {
    Spawns.GetContext().RespawnEnable = true;
    var e = Teams.GetEnumerator();
    while (e.moveNext()) {
        Spawns.GetContext(e.Current).Spawn();
    }
}

function anotherTeam(team) {
    if (team == tTeam) return ctTeam;
    else return tTeam;
}

StartGame();
function StartGame() {
	try {
		state.Value = "Loading";
		Spawns.GetContext().RespawnEnable = false;
		Ui.GetContext().Hint.Value = "Загрузка режима" + WaterMark;
		mainTimer.Restart(LoadTime);
		InitAreas();
		InitTeams();
	} catch (e) { msg.Show(e.name + " " + e.message); }
}

function StartWarmup() {
	let plant_areas = AreaService.GetByTag("plant");
	msg.Show("<B>Приятной игры!</B>", "<B>Режим от just_qstn</B>");
	for (indx in plant_areas) {
		let a = plant_areas[indx];
		let e = a.Ranges.GetEnumerator();
		while (e.moveNext()) {
			let range = e.Current;
			const letters = "qwertyuiopasdfghjklzxcvbnmm1234567890";
			let rnd_name = "";
			for (let i = 0; i < 6; i++) {
				rnd_name += letters[GetRandom(0, letters.length - 1)];
			}
			AreaService.Get(rnd_name).Tags.Add("_plant");
			AreaService.Get(rnd_name).Ranges.Add({ Start: { x: range.Start.x, y: range.Start.y, z: range.Start.z }, End: { x: range.End.x, y: range.End.y, z: range.End.z } });
		}
		a.Tags.Clear();
		a.Ranges.Clear();
	}
	Damage.GetContext().DamageIn.Value = true;
	Properties.GetContext().Get("addedBomb").Value = false;
	state.Value = "Warmup";
	Spawns.GetContext().RespawnEnable = true;
	SpawnTeams();
	Ui.GetContext().Hint.Value = "Разминка" + WaterMark;
    mainTimer.Restart(WarmupTime);
}

function WaitingRound() {
	if (Players.Count == 1) return StartWarmup();
	MapEditor.SetBlock(AreaService.Get("bd"), 93);
    infTimer.Restart(2);
    TeamsBalancer.IsAutoBalance = true;
    Damage.GetContext().DamageIn.Value = false;
    state.Value = "Waiting";
    Spawns.GetContext().RespawnEnable = true;
    SpawnTeams();
    Ui.GetContext().Hint.Value = "Покупайте оружие" + WaterMark;
    mainTimer.Restart(PreRoundTime);
    AreasEnable(true);
	AddBombToRandom();
    Inventory.GetContext().Main.Value = false;
    Inventory.GetContext().Secondary.Value = false;
    Inventory.GetContext().Explosive.Value = false;
    Properties.GetContext().Get("bomb").Value = false;
    const areas = AreaService.GetByTag("defuse");
    for (var i = 0; i < areas.length; i++) {
        areas[i].Tags.Add("_plant");
        areas[i].Tags.Remove("defuse");
    }

    if (!Properties.GetContext().Get("addedBomb").Value) AddBombToRandom();
}

function StartRound() {
    TeamsBalancer.IsAutoBalance = false;
    AreasEnable(false);
    Damage.GetContext().DamageIn.Value = true;
    state.Value = "Round";
    Spawns.GetContext().RespawnEnable = false;
    Ui.GetContext().Hint.Value = "Закладка бомбы" + WaterMark;
    mainTimer.Restart(RoundTime);
	MapEditor.SetBlock(AreaService.Get("bd"), 0);
}

function EndRound(team) {
    Damage.GetContext().DamageIn.Value = false;
    Properties.GetContext().Get("addedBomb").Value = false;
    state.Value = "EndRound";
    plant.Value = false;
    mainTimer.Restart(AfterRoundTime);
    rounds.Value++;
    var aTeam = anotherTeam(team); 

    Ui.GetContext().Hint.Value = team == ctTeam ? "Победил спецназ" : "Победили террористы";
    var e = Players.GetEnumerator();
    while (e.moveNext()) {
        Properties.GetContext(e.Current).Scores.Value += e.Current.Team == team ? DefaultBountyForWin : DefaultBountyForLose + (DefaultBonusForLose * aTeam.Properties.Get("loses").Value);
    }
    team.Properties.Get("wins").Value++;
    team.Properties.Get("loses").Value = Math.round(team.Properties.Get("loses").Value / 2);
    if (team.Properties.Get("loses").Value < 1) team.Properties.Get("loses").Value = 1; 
    aTeam.Properties.Get("loses").Value++;

    if (rounds.Value >= Rounds + 1) EndGame();
}

function EndGame() {
    const winner = ctTeam.Properties.Get("wins").Value > tTeam.Properties.Get("wins").Value ? ctTeam : tTeam;
    Game.GameOver(winner);
    state.Value = "EndGame";
    mainTimer.Restart(LoadTime);
}