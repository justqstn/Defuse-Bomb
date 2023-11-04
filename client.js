// Закладка бомбы от just_qstn

/* MIT License Copyright (c) 2023 just_qstn (vk, tg, discord: just_qstn. old discord: дурак и психопат!#5687)
    
Данная лицензия разрешает лицам, получившим копию данного программного обеспечения и сопутствующей документации (далее — Программное обеспечение), безвозмездно использовать Программное обеспечение без ограничений, включая неограниченное право на использование, копирование, изменение, слияние, публикацию, распространение, сублицензирование и/или продажу копий Программного обеспечения, а также лицам, которым предоставляется данное Программное обеспечение, при соблюдении следующих условий:
Указанное выше уведомление об авторском праве и данные условия должны быть включены во все копии или значимые части данного Программного обеспечения.
ДАННОЕ ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ ПРЕДОСТАВЛЯЕТСЯ «КАК ЕСТЬ», БЕЗ КАКИХ-ЛИБО ГАРАНТИЙ, ЯВНО ВЫРАЖЕННЫХ ИЛИ ПОДРАЗУМЕВАЕМЫХ, ВКЛЮЧАЯ ГАРАНТИИ ТОВАРНОЙ ПРИГОДНОСТИ, СООТВЕТСТВИЯ ПО ЕГО КОНКРЕТНОМУ НАЗНАЧЕНИЮ И ОТСУТСТВИЯ НАРУШЕНИЙ, НО НЕ ОГРАНИЧИВАЯСЬ ИМИ. НИ В КАКОМ СЛУЧАЕ АВТОРЫ ИЛИ ПРАВООБЛАДАТЕЛИ НЕ НЕСУТ ОТВЕТСТВЕННОСТИ ПО КАКИМ-ЛИБО ИСКАМ, ЗА УЩЕРБ ИЛИ ПО ИНЫМ ТРЕБОВАНИЯМ, В ТОМ ЧИСЛЕ, ПРИ ДЕЙСТВИИ КОНТРАКТА, ДЕЛИКТЕ ИЛИ ИНОЙ СИТУАЦИИ, ВОЗНИКШИМ ИЗ-ЗА ИСПОЛЬЗОВАНИЯ ПРОГРАММНОГО ОБЕСПЕЧЕНИЯ ИЛИ ИНЫХ ДЕЙСТВИЙ С ПРОГРАММНЫМ ОБЕСПЕЧЕНИЕМ. 
Если вам лень читать: используешь мой код - скопируй этот текст и вставь его к себе в начало режима*/





// Константы
const ADMIN = "9DE9DFD7D1F5C16A8299BE4D086C6372AAA9FBB8CCA3CD902F1955AAE64508B9", ROUNDS = GameMode.Parameters.GetBool("short_game") ? 16 : 30, LOADING_TIME = 10, WARMUP_TIME = GameMode.Parameters.GetBool("TestMode") ? 5 : 90, PRE_ROUND_TIME = GameMode.Parameters.GetBool("TestMode") ? 10 : 30, ROUND_TIME = GameMode.Parameters.GetBool("TestMode") ? 30 : 150, AFTER_ROUND_TIME = 10, END_TIME = 15, BEFORE_PLANTING_TIME = GameMode.Parameters.GetBool("TestMode") ? 4 : 60, BOMB_PLANTING_TIME = 3, BOMB_DEFUSE_TIME = 7, BOMB_DEFUSEKIT_TIME = 3, HELMET_HP = 130, VEST_HP = 160,
	SECONDARY_COST = 650, MAIN_COST = 2850, EXPLOSIVE_COST = 300, DEFUSEKIT_COST = 350, HELMET_COST = 650, VEST_COST = 1200, DEFAULT_MONEY = 1000, MAX_MONEY = 6000, BOUNTY_WIN = 1500, BOUNTY_LOSE = 800, BOUNTY_LOSE_BONUS = 500, BOUNTY_KILL = 250, BOUNTY_PLANT = 300, BOUNTY_DEFUSE = 500, MAX_LOSS_BONUS = 5;

// Переменные
let cnt = 0, last_rid = 0, BLACKLIST = Properties.GetContext().Get("banned"); state = Properties.GetContext().Get("state"), is_planted = Properties.GetContext().Get("is_planted"), main_timer = Timers.GetContext().Get("main"), round = Properties.GetContext().Get("round"), bomb = Properties.GetContext().Get("bomb");
main_wp_trigger = AreaPlayerTriggerService.Get("main"), secondary_wp_trigger = AreaPlayerTriggerService.Get("secondary"), explosive_wp_trigger = AreaPlayerTriggerService.Get("explosive"), bomb_trigger = AreaPlayerTriggerService.Get("bomb"), defkit_trigger = AreaPlayerTriggerService.Get("defkit"),
	defuse_trigger = AreaPlayerTriggerService.Get("defuse"), plant_trigger = AreaPlayerTriggerService.Get("plant"), helmet_trigger = AreaPlayerTriggerService.Get("helmet"), vest_trigger = AreaPlayerTriggerService.Get("armour"), next_trigger = AreaPlayerTriggerService.Get("next"), prev_trigger = AreaPlayerTriggerService.Get("prev"), ban_trigger = AreaPlayerTriggerService.Get("ban"), refresh_trigger = AreaPlayerTriggerService.Get("refresh");

// Настройка
state.Value = "loading";
is_planted.Value = false;
round.Value = 0;
Inventory.GetContext().Build.Value = false;
TeamsBalancer.IsAutoBalance = false;
BreackGraph.Damage = false;
BLACKLIST.Value = "C3EB1387A99FC76ED";
Map.Rotation = GameMode.Parameters.GetBool("MapRotation")
Damage.GetContext().GranadeTouchExplosion.Value = false;

// Создание команд
Teams.Add("t", "<i><B><size=38>Т</size><size=30>еррористы</size></B>\nзакладка бомбы от just_qstn</i>", rgb(210, 150, 70));
Teams.Add("ct", "<i><B><size=38>С</size><size=30>пецназ</size></B>\nзакладка бомбы от just_qstn</i>", rgb(70, 145, 210));
Teams.Add("banned", "<i><B><size=38>З</size><size=30>абаненные</size></B>\nзакладка бомбы от just_qstn</i>", {m: 1});
let t_team = Teams.Get("t"), ct_team = Teams.Get("ct"), banned_team = Teams.Get("banned");
t_team.Spawns.SpawnPointsGroups.Add(2);
ct_team.Spawns.SpawnPointsGroups.Add(1);

Teams.OnAddTeam.Add(function (t) {
	t.Properties.Get("loses").Value = 0;
	t.Properties.Get("wins").Value = 0;
});

// Интерфейс
LeaderBoard.PlayerLeaderBoardValues = [
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
LeaderBoard.PlayersWeightGetter.Set(function (p) {
	return p.Properties.Get("Kills").Value;
});

Ui.GetContext().TeamProp1.Value = { Team: "t", Prop: "hint" };
Ui.GetContext().TeamProp2.Value = { Team: "ct", Prop: "hint" };

Ui.GetContext().MainTimerId.Value = main_timer.Id;

// События
Teams.OnRequestJoinTeam.Add(function (p, t) {
	if (t == banned_team) return;
	if (BLACKLIST.Value.search(p.Id) != -1) {
		banned_team.Add(p);
		p.Spawns.Spawn();
		p.Spawns.Despawn();
		return p.Properties.Get("banned").Value = true;
	}
	p.Properties.Scores.Value = DEFAULT_MONEY;
	p.Properties.Get("bomb").Value = false;
	p.Properties.Get("defkit").Value = false;
	if (ADMIN.search(p.Id) != -1) {
		p.Properties.Get("admin").Value = true;
	}
	else {
		AreaViewService.GetContext(p).Get("ban").Enable = false;
		AreaViewService.GetContext(p).Get("next").Enable = false;
		AreaViewService.GetContext(p).Get("prev").Enable = false;
		AreaViewService.GetContext(p).Get("refresh").Enable = false;
	}
	last_rid = p.IdInRoom;
	let ct_c = ct_team.Count - (p.Team == ct_team ? 1 : 0),
		t_c = t_team.Count - (p.Team == t_team ? 1 : 0);
	if (ct_c != t_c) {
		if (ct_c < t_c) ct_team.Add(p);
		else if (ct_c > t_c) t_team.Add(p);
	}
	else t.Add(p);
});

Teams.OnPlayerChangeTeam.Add(function (p) {
	if (state.Value == "round" || state.Value == "end_round") {
		p.Spawns.Spawn();
		p.Spawns.Despawn();
		p.Ui.Hint.Value = "Игра уже началась. Ждите конца игры";
		p.Timers.Get("clear").Restart(10);
	} else p.Spawns.Spawn();
});

Damage.OnDeath.Add(function (p) {
	if (state.Value == "round" || state.Value == "end_round") {
		p.Properties.Deaths.Value++;
		p.Properties.Get("defkit").Value = false;
		if (p.Properties.Get("bomb").Value) bomb.Value = true;
		p.Properties.Get("bomb").Value = false;
		p.Properties.Get("alive").Value = false;
		p.Inventory.Main.Value = false;
		p.Inventory.Secondary.Value = false;
		p.Inventory.Explosive.Value = false;
		p.contextedProperties.MaxHp.Value = 100;
		p.Spawns.Despawn();
	}
});

Players.OnPlayerConnected.Add(function (p) {
	last_rid = p.IdInRoom;
	if (BLACKLIST.Value.search(p.Id) != -1) {
		banned_team.Add(p);
		p.Spawns.Spawn();
		p.Spawns.Despawn();
		p.Properties.Get("banned").Value = true;
	}
});

Players.OnPlayerDisconnected.Add(function (p) {
	cnt -= p.IdInRoom;
	if (state.Value == "round") {
		if (c_GetAlivePlayersCount(t_team) <= 0 && !is_planted.Value) return EndRound(ct_team);
		if (c_GetAlivePlayersCount(ct_team) <= 0) return EndRound(t_team);
	}
});

Properties.OnPlayerProperty.Add(function (c, v) {
	switch (v.Name) {
		case "Scores":
			if (v.Value > MAX_MONEY) v.Value = MAX_MONEY;
			break;
		case "Deaths":
			c.Player.Team.Properties.Get("hint").Value = "< Победы: " + c.Player.Team.Properties.Get("wins").Value + " >\n\n< Живых: " + (c_GetAlivePlayersCount(c.Player.Team) || "-") + " >";
			if (!is_planted.Value && c_GetAlivePlayersCount(c.Player.Team) <= 0) EndRound(AnotherTeam(c.Player.Team));
			if (c.Player.Team == ct_team && is_planted.Value && c_GetAlivePlayersCount(c.Player.Team) <= 0) EndRound(t_team);
			break;
	}
});

Properties.OnTeamProperty.Add(function (c, v) {
	if (v.Name != "hint") {
		c.Team.Properties.Get("hint").Value = "< Победы: " + c.Team.Properties.Get("wins").Value + " >\n\n< Живых: " + (c_GetAlivePlayersCount(c.Team) || "-") + " >";
	}
});

Damage.OnKill.Add(function (p, _k) {
	if (state.Value == "round" || state.Value == "end_round") {
		if (_k.Team != null && _k.Team != p.Team) {
			p.Properties.Kills.Value++;
			p.Properties.Scores.Value += BOUNTY_KILL;
		}
	}
});

Spawns.OnSpawn.Add(function (p) {
	if (p.Properties.Get("banned").Value) return p.Spawns.Despawn();
	if (p.Properties.Scores.Value > MAX_MONEY) p.Properties.Scores.Value = MAX_MONEY;
	if (state.Value == "waiting") {
		p.Timers.Get("clear").Restart(PRE_ROUND_TIME);
		p.Properties.Get("true").Value = true;
	}
});

// Зоны
main_wp_trigger.OnEnter.Add(function (p, a) {
	if (state.Value != "waiting") return;
	let prop = p.Properties.Get(a.Name + "_accept");
	if (p.Inventory.Main.Value) return p.Ui.Hint.Value = "Основное оружие уже куплено";
	if (prop.Value) {
		if (p.Properties.Scores.Value >= MAIN_COST) {
			p.Properties.Scores.Value -= MAIN_COST;
			p.Ui.Hint.Value = "Вы купили основное оружие";
			p.Inventory.Main.Value = true;
		} else {
			p.Ui.Hint.Value = "Недостаточно денег. Нужно еще " + (MAIN_COST - p.Properties.Scores.Value);
		}
		return prop.Value = false;
	} else {
		p.Ui.Hint.Value = "Вы хотите купить основное оружие за " + MAIN_COST + ".\nВойдите в зону второй раз чтобы купить";
		return prop.Value = true;
	}
});

main_wp_trigger.OnExit.Add(function (p) { p.Ui.Hint.Reset(); });

secondary_wp_trigger.OnEnter.Add(function (p, a) {
	if (state.Value != "waiting") return;
	let prop = p.Properties.Get(a.Name + "_accept");
	if (p.Inventory.Secondary.Value) return p.Ui.Hint.Value = "Вторичное оружие уже куплено";
	if (prop.Value) {
		if (p.Properties.Scores.Value >= SECONDARY_COST) {
			p.Properties.Scores.Value -= SECONDARY_COST;
			p.Ui.Hint.Value = "Вы купили вторичное оружие";
			p.Inventory.Secondary.Value = true;
		} else {
			p.Ui.Hint.Value = "Недостаточно денег. Нужно еще " + (SECONDARY_COST - p.Properties.Scores.Value);
		}
		return prop.Value = false;
	} else {
		p.Ui.Hint.Value = "Вы хотите купить вторичное оружие за " + SECONDARY_COST + ".\nВойдите в зону второй раз чтобы купить";
		return prop.Value = true;
	}
});

secondary_wp_trigger.OnExit.Add(function (p) { p.Ui.Hint.Reset(); });

explosive_wp_trigger.OnEnter.Add(function (p, a) {
	if (state.Value != "waiting") return;
	let prop = p.Properties.Get(a.Name + "_accept");
	if (p.Inventory.Explosive.Value) return p.Ui.Hint.Value = "Взрывчатка уже куплена";
	if (prop.Value) {
		if (p.Properties.Scores.Value >= EXPLOSIVE_COST) {
			p.Properties.Scores.Value -= EXPLOSIVE_COST;
			p.Ui.Hint.Value = "Вы купили взрывчатку";
			p.Inventory.Explosive.Value = true;
		} else {
			p.Ui.Hint.Value = "Недостаточно денег. Нужно еще " + (EXPLOSIVE_COST - p.Properties.Scores.Value);
		}
		return prop.Value = false;
	} else {
		p.Ui.Hint.Value = "Вы хотите купить взрывчатку за " + EXPLOSIVE_COST + ".\nВойдите в зону второй раз чтобы купить";
		return prop.Value = true;
	}
});

explosive_wp_trigger.OnExit.Add(function (p) { p.Ui.Hint.Reset(); });

defkit_trigger.OnEnter.Add(function (p, a) {
	if (state.Value != "waiting") return;
	let prop = p.Properties.Get(a.Name + "_accept");
	if (p.Properties.Get("defkit").Value) return p.Ui.Hint.Value = "Набор сапера уже куплен";
	if (prop.Value) {
		if (p.Properties.Scores.Value >= DEFUSEKIT_COST) {
			p.Properties.Scores.Value -= DEFUSEKIT_COST;
			p.Ui.Hint.Value = "Вы купили набор сапера";
			p.Properties.Get("defkit").Value = true;
		} else {
			p.Ui.Hint.Value = "Недостаточно денег. Нужно еще " + (DEFUSEKIT_COST - p.Properties.Scores.Value);
		}
		return prop.Value = false;
	} else {
		p.Ui.Hint.Value = "Вы хотите купить набор сапера за " + DEFUSEKIT_COST + ".\nВойдите в зону второй раз чтобы купить";
		return prop.Value = true;
	}
});

defkit_trigger.OnExit.Add(function (p) { p.Ui.Hint.Reset(); });

helmet_trigger.OnEnter.Add(function (p, a) {
	if (state.Value != "waiting") return;
	let prop = p.Properties.Get(a.Name + "_accept");
	if (p.contextedProperties.MaxHp.Value >= HELMET_HP) return p.Ui.Hint.Value = "Шлем уже куплен";
	if (prop.Value) {
		if (p.Properties.Scores.Value >= HELMET_COST) {
			p.Properties.Scores.Value -= HELMET_COST;
			p.Ui.Hint.Value = "Вы купили шлем";
			p.contextedProperties.MaxHp.Value = HELMET_HP;
			p.Spawns.Spawn();
		} else {
			p.Ui.Hint.Value = "Недостаточно денег. Нужно еще " + (HELMET_COST - p.Properties.Scores.Value);
		}
		return prop.Value = false;
	} else {
		p.Ui.Hint.Value = "Вы хотите купить шлем (+" + HELMET_HP + ") за " + HELMET_COST + ".\nВойдите в зону второй раз чтобы купить";
		return prop.Value = true;
	}
});

helmet_trigger.OnExit.Add(function (p) { p.Ui.Hint.Reset(); });

vest_trigger.OnEnter.Add(function (p, a) {
	if (state.Value != "waiting") return;
	let prop = p.Properties.Get(a.Name + "_accept");
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
});

vest_trigger.OnExit.Add(function (p) { p.Ui.Hint.Reset(); });

bomb_trigger.OnEnter.Add(function (p) {
	if (p.Team == ct_team) return;
	if (bomb.Value) {
		if (p.Properties.Get("bomb").Value) return p.Ui.Hint.Value = "Бомба уже положена"
		p.Properties.Get("bomb").Value = true;
		bomb.Value = false;
		p.Ui.Hint.Value = "Вы взяли бомбу";
	}
	else {
		if (p.Properties.Get("bomb").Value) {
			p.Properties.Get("bomb").Value = false;
			bomb.Value = true;
			p.Ui.Hint.Value = "Вы положили бомбу";
		}
		p.Ui.Hint.Value = "Бомбы нету!";
	}
});

bomb_trigger.OnExit.Add(function (p) { p.Ui.Hint.Reset(); });

plant_trigger.OnEnter.Add(function (p, a) {
	if (!is_planted.Value && p.Team == t_team) {
		if (state.Value != "round") return p.Ui.Hint.Value = "Место закладки бомбы";
		if (!p.Properties.Get("bomb").Value) return p.Ui.Hint.Value = "У вас нет бомбы.";
		p.Ui.Hint.Value = "Ждите " + BOMB_PLANTING_TIME + "сек. в зоне чтобы заложить бомбу";
		return p.Timers.Get("plant" + a.Name).Restart(BOMB_PLANTING_TIME);
	}
	if (is_planted.Value && p.Team == ct_team && AreaViewService.GetContext().Get(a.Name).Color.r > 0) {
		if (state.Value != "round") return p.Ui.Hint.Value = "Место разминирования бомбы";
		let def_time = p.Properties.Get("defkit").Value ? BOMB_DEFUSEKIT_TIME : BOMB_DEFUSE_TIME;
		p.Ui.Hint.Value = "Ждите " + def_time + "сек. чтобы разминировать бомбу";
		p.Timers.Get("defuse" + a.Name).Restart(def_time);
	}
});

plant_trigger.OnExit.Add(function (p, a) {
	p.Ui.Hint.Reset();
	if (p.Team == t_team) return p.Timers.Get("plant" + a.Name).Stop();
	else return p.Timers.Get("defuse" + a.Name).Stop();
});

// честно, мне лень переписывать это все, ну вы и так схаваете
let players = [];

function refresh() {
	let e = Players.GetEnumerator();
	players = [];
	cnt = 0;
	while (e.moveNext()) {
		players.push(e.Current.IdInRoom)
		cnt += e.Current.IdInRoom;
	}
}

next_trigger.OnEnter.Add(function (p, a) {
	if (p.Properties.Get("admin").Value) {
		if (players.length == 0) refresh();
		let indx = p.Properties.Get("index");
		if (indx.Value < Players.Count - 1) indx.Value++;
		else indx.Value = 0;
		let plr = Players.GetByRoomId(players[indx.Value])
		p.Ui.Hint.Value = (indx.Value + 1) + ". " + plr.NickName + "\nid: " + plr.Id + "\nbanned: " + plr.Properties.Get("banned").Value;
		p.Timers.Get("clear").Restart(5);
	}
});

prev_trigger.OnEnter.Add(function (p, a) {
	if (p.Properties.Get("admin").Value) {
		if (Players.Count != players.length) refresh();
		let indx = p.Properties.Get("index");
		if (indx.Value == 0) indx.Value--;
		else indx.Value = Players.Count - 1;
		let plr = Players.GetByRoomId(players[indx.Value])
		p.Ui.Hint.Value = (indx.Value + 1) + ". " + plr.NickName + "\nid: " + plr.Id + "\nbanned: " + plr.Properties.Get("banned").Value;
		p.Timers.Get("clear").Restart(5);
	}
});

ban_trigger.OnEnter.Add(function (p, a) {
	if (p.Properties.Get("admin").Value) {
		p.Timers.Get("clear").Restart(5);
		if (players.length == 0) {
			refresh();
			return p.Ui.Hint.Value = "Перезагружен массив игроков, выберите игрока еще раз.";
		}
		let indx = p.Properties.Get("index");
		let plr = Players.GetByRoomId(players[indx.Value])
		p.Ui.Hint.Value = "забанен " + plr.NickName + "\nid: " + plr.Id;
		plr.Spawns.Spawn();
		plr.Spawns.Despawn();
		plr.Properties.Get("banned").Value;
		BLACKLIST.Value += plr.Id;
		banned_team.Add(p)
	}
});

refresh_trigger.OnEnter.Add(function (p, a) {
	if (p.Properties.Get("admin").Value) {
		refresh();
		p.Ui.Hint.Value = "Массив игроков перезагружен";
		p.Timers.Get("clear").Restart(5);
	}
});

// Таймеры
Timers.OnPlayerTimer.Add(function (timer) {
	if (timer.Id == "clear") return timer.Player.Ui.Hint.Reset();
	if (!timer.Player.IsAlive) return;
	if (timer.Id.slice(0, 5) == "plant") {
		const area_name = timer.Id.replace("plant", "");
		if (AreaViewService.GetContext().Get(area_name).Color.r == 1 || is_planted.Value || state.Value != "round") return;
		Ui.GetContext().Hint.Value = "Бомба заложена. Спецназ должен разминировать красную зону.";
		is_planted.Value = true;
		main_timer.Restart(BEFORE_PLANTING_TIME);
		timer.Player.Properties.Scores.Value += BOUNTY_PLANT;
		timer.Player.Properties.Get("bomb").Value = false;
		AreaViewService.GetContext().Get(area_name).Color = { r: 1, g: 0 };
	}
	if (timer.Id.slice(0, 6) == "defuse") {
		const area_name = timer.Id.replace("defuse", "");
		if (AreaViewService.GetContext().Get(area_name).Color.r < 1 || state.Value != "round") return;
		is_planted.Value = false;
		timer.Player.Properties.Scores.Value += BOUNTY_DEFUSE;
		AreaViewService.GetContext().Get(area_name).Color = { r: 0, g: 1 };
		EndRound(ct_team);
	}
});

main_timer.OnTimer.Add(function () {
	switch (state.Value) {
		case "loading":
			StartWarmup();
			break;
		case "warmup":
			WaitingRound();
			break;
		case "waiting":
			StartRound();
			break;
		case "round":
			if (is_planted.Value) EndRound(t_team);
			else EndRound(ct_team);
			break;
		case "end_round":
			if (round.Value == ROUNDS / 2 && !Properties.GetContext().Get("teams_changed").Value) {
				main_timer.Restart(3);
				TeamChange();
				Properties.GetContext().Get("teams_changed").Value = true;
				break;
			}
			WaitingRound();
			break
		case "end_game":
			Game.RestartGame();
			break;
	}
});

// Функции
function rgb(r, g, b) { return { r: r / 255, b: b / 255, g: g / 255 }; }

function GetRandom(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function AnotherTeam(t) {
	if (t == t_team) return ct_team;
	else return t_team;
}

function c_GetAlivePlayersCount(t) {
	ret = 0;
	for (e = Players.GetEnumerator(); e.MoveNext();) if (e.Current.Team == t && e.Current.Spawns.IsSpawned && e.Current.IsAlive) ret++;
	return ret;
}

function AddBombToRandom() {
	if (t_team.Count == 0) return;
	let plrs = [], e = Players.GetEnumerator();
	while (e.moveNext()) {
		if (e.Current.Team == t_team) plrs.push(e.Current.IdInRoom);
	}
	let countplr = Math.round(t_team.Count / 2);
	if (countplr < 1) countplr = 1;
	for (let i = 0; i < countplr; i++) {
		let p = Players.GetByRoomId(plrs[GetRandom(0, plrs.length - 1)]);
		p.Properties.Get("bomb").Value = true;
		p.Ui.Hint.Value = "Вы получили бомбу!";
		p.Timers.Get("clear").Restart(30);
	}
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

function InitAreas() {
	AddArea(["main"], "main", rgb(255, 32, 0));
	AddArea(["secondary"], "secondary", rgb(255, 255, 0));
	AddArea(["explosive"], "explosive", rgb(0, 255, 179));
	AddArea(["bomb"], "bomb", rgb(255, 0, 255));
	AddArea(["defkit"], "defkit", rgb(255, 0, 255));
	AddArea(["armour"], "armour", rgb(128, 96, 255));
	AddArea(["_plant"], "plant", rgb(0, 255, 0));
	AddArea(["defuse"], "defuse", rgb(255, 0, 0));
	AddArea(["helmet"], "helmet", rgb(0, 255, 0));
	AddArea(["ban"], "ban", rgb(255, 255, 0));
	AddArea(["next"], "next", rgb(0, 255, 0));
	AddArea(["prev"], "prev", rgb(255, 0, 0));
	AddArea(["refresh"], "refresh", rgb(0, 0, 255));
}

function AreasEnable(v) {
	AreaViewService.GetContext().Get("main").Enable = v;
	AreaViewService.GetContext().Get("secondary").Enable = v;
	AreaViewService.GetContext().Get("explosive").Enable = v;
	AreaViewService.GetContext().Get("defkit").Enable = v;
	AreaViewService.GetContext().Get("spawn").Enable = v;
	AreaViewService.GetContext().Get("armour").Enable = v;
	AreaViewService.GetContext().Get("helmet").Enable = v;
}

function SpawnTeams() {
	Spawns.GetContext().RespawnEnable = true;
	let e = Teams.GetEnumerator();
	while (e.moveNext()) {
		if (e.Current != banned_team) Spawns.GetContext(e.Current).Spawn();
	}
}

StartGame();
function StartGame() {
	Spawns.GetContext().RespawnEnable = false;
	Ui.GetContext().Hint.Value = "Загрузка режима";
	AreasEnable(false);
	for (let e = Players.GetEnumerator(); e.moveNext();) {
		if (BLACKLIST.Value.search(e.Current.Id) != -1) {
			e.Current.Spawns.Spawn();
			e.Current.Spawns.Despawn();
			e.Current.Properties.Get("banned").Value = true;
			banned_team.Add(e.Current);
		}
	}
	main_timer.Restart(LOADING_TIME);
	InitAreas();
}

function StartWarmup() {
	try {
		state.Value = "warmup";
		let plant_areas = AreaService.GetByTag("plant");
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
				let rnd = AreaService.Get(rnd_name);
				rnd.Tags.Add("_plant");
				AreaViewService.GetContext().Get(rnd_name).Color = { r: 0, g: 1 };
				AreaViewService.GetContext().Get(rnd_name).Area = rnd;
				AreaViewService.GetContext().Get(rnd_name).Enable = true;
				rnd.Ranges.Add({ Start: { x: range.Start.x, y: range.Start.y, z: range.Start.z }, End: { x: range.End.x, y: range.End.y, z: range.End.z } });
			}
			a.Tags.Clear();
			a.Ranges.Clear();
		}
		Damage.GetContext().DamageIn.Value = true;
		Spawns.GetContext().RespawnEnable = true;
		SpawnTeams();
		Ui.GetContext().Hint.Value = "Разминка";
		main_timer.Restart(WARMUP_TIME);
	} catch (e) { msg.Show(e.name + " " + e.message); }
}

function WaitingRound() {
	state.Value = "waiting";
	MapEditor.SetBlock(AreaService.Get("bd"), 93);
	MapEditor.SetBlock(AreaService.Get("bd"), 93);
	BalanceTeams();
	Damage.GetContext().DamageIn.Value = false;
	Ui.GetContext().Hint.Value = "Покупайте оружиe";
	AreasEnable(true);
	Inventory.GetContext().Main.Value = false;
	Inventory.GetContext().Secondary.Value = false;
	Inventory.GetContext().Explosive.Value = false;
	Properties.GetContext().Get("bomb").Value = false;
	const areas = AreaService.GetByTag("_plant");
	for (let i = 0; i < areas.length; i++) {
		AreaViewService.GetContext().Get(areas[i].Name).Color = { r: 0, g: 1 };
	}
	main_timer.Restart(PRE_ROUND_TIME);
	SpawnTeams();
	AddBombToRandom();
}

function StartRound() {
	t_team.Properties.Get("hint").Value = "< Победы: " + t_team.Properties.Get("wins").Value + " >\n\n< Живых: " + (c_GetAlivePlayersCount(t_team) || "-") + " >";
	ct_team.Properties.Get("hint").Value = "< Победы: " + ct_team.Properties.Get("wins").Value + " >\n\n< Живых: " + (c_GetAlivePlayersCount(ct_team) || "-") + " >";
	AreasEnable(false);
	Damage.GetContext().DamageIn.Value = true;
	state.Value = "round";
	Spawns.GetContext().RespawnEnable = false;
	Ui.GetContext().Hint.Value = "Закладка бомбы. Раунд " + (round.Value + 1) + "/" + ROUNDS;
	main_timer.Restart(ROUND_TIME);
	MapEditor.SetBlock(AreaService.Get("bd"), 0);
	MapEditor.SetBlock(AreaService.Get("bd"), 0);
}

function EndRound(t) {
	state.Value = "end_round";
	Damage.GetContext().DamageIn.Value = false;
	Properties.GetContext().Get("addedBomb").Value = false;
	is_planted.Value = false;
	main_timer.Restart(AFTER_ROUND_TIME);
	let aTeam = AnotherTeam(t);
	round.Value++;
	Ui.GetContext().Hint.Value = t == ct_team ? "Победил спецназ" : "Победили террористы";
	let e = Players.GetEnumerator();
	while (e.moveNext()) {
		Properties.GetContext(e.Current).Scores.Value += e.Current.Team == t ? BOUNTY_WIN : BOUNTY_LOSE + (BOUNTY_LOSE_BONUS * aTeam.Properties.Get("loses").Value);
	}
	t.Properties.Get("wins").Value++;
	t.Properties.Get("loses").Value = Math.round(t.Properties.Get("loses").Value / 2);
	if (t.Properties.Get("loses").Value < 1) t.Properties.Get("loses").Value = 0;
	aTeam.Properties.Get("loses").Value++;

	if (t.Properties.Get("wins").Value > ROUNDS / 2) return EndGame();
	if (round.Value >= ROUNDS && ct_team.Properties.Get("wins").Value != t_team.Properties.Get("wins").Value) EndGame();
}

function BalanceTeams() {
	let ct_plrs = [], t_plrs = [], e = Players.GetEnumerator();
	let ct_count = ct_team.Count, t_count = t_team.Count;
	while (e.moveNext()) {
		if (e.Current.Team == ct_team) ct_plrs.push(e.Current.IdInRoom);
		if (e.Current.Team == t_team) t_plrs.push(e.Current.IdInRoom);
	}

	while (ct_count - 1 > t_count) {
		t_team.Add(Players.GetByRoomId(ct_plrs[ct_plrs.length - 1]));
		ct_count--;
	}

	while (t_count - 1 > ct_count) {
		ct_team.Add(Players.GetByRoomId(t_plrs[t_plrs.length - 1]));
		t_count--;
	}
}

function TeamChange() {
	const t_wins = t_team.Properties.Get("wins").Value, ct_wins = ct_team.Properties.Get("wins").Value;
	let iter = Players.GetEnumerator();
	while (iter.moveNext()) {
		iter.Current.Properties.Scores.Value = DEFAULT_MONEY;
		iter.Current.Inventory.Main.Value = false;
		iter.Current.Inventory.Secondary.Value = false;
		iter.Current.Inventory.Explosive.Value = false;
		iter.Current.contextedProperties.MaxHp.Value = 100;
		if (iter.Current.Team == t_team) ct_team.Add(iter.Current);
		if (iter.Current.Team == ct_team) t_team.Add(iter.Current);
	}
	t_team.Properties.Get("wins").Value = ct_wins;
	t_team.Properties.Get("loses").Value = 0;
	ct_team.Properties.Get("wins").Value = t_wins;
	ct_team.Properties.Get("loses").Value = 0;
}

function EndGame() {
	const winner = ct_team.Properties.Get("wins").Value > t_team.Properties.Get("wins").Value ? ct_team : t_team;
	Game.GameOver(winner);
	state.Value = "end_game";
	main_timer.Restart(END_TIME);
}
