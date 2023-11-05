try {
	/* 
Закладка бомбы от just_qstn  
Bomb Planting by just_qstn
Gamemode for Pixel Combats 2

VERSION = 2

MIT License Copyright (c) 2023 just_qstn (vk, tg, discord: just_qstn. old discord: дурак и психопат!#5687)
    
Данная лицензия разрешает лицам, получившим копию данного программного обеспечения и сопутствующей документации (далее — Программное обеспечение), безвозмездно использовать Программное обеспечение без ограничений, включая неограниченное право на использование, копирование, изменение, слияние, публикацию, распространение, сублицензирование и/или продажу копий Программного обеспечения, а также лицам, которым предоставляется данное Программное обеспечение, при соблюдении следующих условий:
Указанное выше уведомление об авторском праве и данные условия должны быть включены во все копии или значимые части данного Программного обеспечения.
ДАННОЕ ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ ПРЕДОСТАВЛЯЕТСЯ «КАК ЕСТЬ», БЕЗ КАКИХ-ЛИБО ГАРАНТИЙ, ЯВНО ВЫРАЖЕННЫХ ИЛИ ПОДРАЗУМЕВАЕМЫХ, ВКЛЮЧАЯ ГАРАНТИИ ТОВАРНОЙ ПРИГОДНОСТИ, СООТВЕТСТВИЯ ПО ЕГО КОНКРЕТНОМУ НАЗНАЧЕНИЮ И ОТСУТСТВИЯ НАРУШЕНИЙ, НО НЕ ОГРАНИЧИВАЯСЬ ИМИ. НИ В КАКОМ СЛУЧАЕ АВТОРЫ ИЛИ ПРАВООБЛАДАТЕЛИ НЕ НЕСУТ ОТВЕТСТВЕННОСТИ ПО КАКИМ-ЛИБО ИСКАМ, ЗА УЩЕРБ ИЛИ ПО ИНЫМ ТРЕБОВАНИЯМ, В ТОМ ЧИСЛЕ, ПРИ ДЕЙСТВИИ КОНТРАКТА, ДЕЛИКТЕ ИЛИ ИНОЙ СИТУАЦИИ, ВОЗНИКШИМ ИЗ-ЗА ИСПОЛЬЗОВАНИЯ ПРОГРАММНОГО ОБЕСПЕЧЕНИЯ ИЛИ ИНЫХ ДЕЙСТВИЙ С ПРОГРАММНЫМ ОБЕСПЕЧЕНИЕМ. 
Если вам лень читать: используешь мой код - скопируй этот текст и вставь его к себе в начало режима
*/

	// Константы. Если есть вопросы по поводу баланса - идите сюда
	const ADMIN = "9DE9DFD7D1F5C16A8299BE4D086C6372AAA9FBB8CCA3CD902F1955AAE64508B9",
		ROUNDS = GameMode.Parameters.GetBool("short_game") ? 16 : 30,
		LOADING_TIME = 10, 					// время загрузки
		WARMUP_TIME = 90, 					// время разминки
		PRE_ROUND_TIME = 30, 				// время покупки снаряжения
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

	// Переменные
	let players = [],
		last_rid = 0,
		BLACKLIST = Properties.GetContext().Get("banned"),
		state = Properties.GetContext().Get("state"),
		is_planted = Properties.GetContext().Get("is_planted"),
		main_timer = Timers.GetContext().Get("main"),
		round = Properties.GetContext().Get("round"),
		bomb = Properties.GetContext().Get("bomb");

	// Настройки
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
	Teams.Add("banned", "<i><B><size=38>З</size><size=30>абаненные</size></B>\nзакладка бомбы от just_qstn</i>", { m: 1 });
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
		if (ADMIN.search(p.Id) != -1) p.Properties.Get("admin").Value = true;
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
		} else if (p.Team != banned_team) p.Spawns.Spawn();
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
		}
	});

	// Зоны
	

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
				Game.RestartGame();
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
				BLACKLIST.Value = null;
				Game.RestartGame();
				break;
		}
	});

	// Функции
	function refresh() {
		players = [];
		for (e = Players.GetEnumerator(); e.moveNext();) players.push(e.Current.IdInRoom)
	}

	function rgb(r, g, b) { return { r: r / 255, b: b / 255, g: g / 255 }; }

	function AddArea(params) {
		let t = AreaPlayerTriggerService.Get(params.name), v = AreaViewService.GetContext().Get(params.name);
		v.Tags = params.tags;
		t.Tags = params.tags;
		v.Color = params.color;
		v.Enable = params.view || true;
		t.Enable = params.trigger || true;
		t.OnEnter.Add(params.enter);
		t.OnExit.Add(params.exit);
		return { Trigger: t, View: t };
	}

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
		let plrs = [];
		for (let e = Players.GetEnumerator(); e.moveNext();)if (e.Current.Team == t_team) plrs.push(e.Current.IdInRoom);
		let countplr = Math.round(t_team.Count / 2);
		if (countplr < 1) countplr = 1;
		for (let i = 0; i < countplr; i++) {
			let p = Players.GetByRoomId(plrs[GetRandom(0, plrs.length - 1)]);
			p.Properties.Get("bomb").Value = true;
			p.Ui.Hint.Value = "Вы получили бомбу!";
			p.Timers.Get("clear").Restart(30);
		}
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
		if (aTeam.Properties.Get("loses").Value < MAX_LOSS_BONUS) aTeam.Properties.Get("loses").Value++;

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
} catch (e) { Validate.ReportInvalid(e.name + " " + e.message); }
