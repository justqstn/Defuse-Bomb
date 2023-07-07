try {
    // Закладка бомбы от just_qstn
    // v1





    // Константы
    const ROUNDS = GameMode.Parameters.GetBool("TestMode") ? 1 : 30, LOADING_TIME = 10, WARMUP_TIME = GameMode.Parameters.GetBool("TestMode") ? 5 : 90, PRE_ROUND_TIME = GameMode.Parameters.GetBool("TestMode") ? 10 : 30, ROUND_TIME = GameMode.Parameters.GetBool("TestMode") ? 30 : 150, AFTER_ROUND_TIME = 10, END_TIME = 15, BEFORE_PLANTING_TIME = 60, BOMB_PLANTING_TIME = 3, BOMB_DEFUSE_TIME = 7, BOMB_DEFUSEKIT_TIME = 3, HELMET_HP = 130, VEST_HP = 160,
        SECONDARY_COST = 650, MAIN_COST = 2850, EXPLOSIVE_COST = 300, DEFUSEKIT_COST = 350, HELMET_COST = 650, VEST_COST = 1200, DEFAULT_MONEY = 1000, MAX_MONEY = 6000, BOUNTY_WIN = 1500, BOUNTY_LOSE = 800, BOUNTY_LOSE_BONUS = 500, BOUNTY_KILL = 250, BOUNTY_PLANT = 300, BOUNTY_DEFUSE = 500;

    // Переменные
    let state = Properties.GetContext().Get("state"), is_planted = Properties.GetContext().Get("is_planted"), main_timer = Timers.GetContext().Get("main"), round = Properties.GetContext().Get("round"), bomb = Properties.GetContext().Get("bomb");
    main_wp_trigger = AreaPlayerTriggerService.Get("main"), secondary_wp_trigger = AreaPlayerTriggerService.Get("secondary"), explosive_wp_trigger = AreaPlayerTriggerService.Get("explosive"), bomb_trigger = AreaPlayerTriggerService.Get("bomb"), defkit_trigger = AreaPlayerTriggerService.Get("defkit"),
        defuse_trigger = AreaPlayerTriggerService.Get("defuse"), plant_trigger = AreaPlayerTriggerService.Get("plant"), helmet_trigger = AreaPlayerTriggerService.Get("helmet"), vest_trigger = AreaPlayerTriggerService.Get("armour");

    // Настройка
    state.Value = "loading";
    is_planted.Value = false;
    round.Value = 0;
    Inventory.GetContext().Build.Value = false;
    TeamsBalancer.IsAutoBalance = true;
    BreackGraph.Damage = false;
    Damage.GetContext().GranadeTouchExplosion.Value = false;

    // Создание команд
    Teams.Add("t", "<i><B><size=38>Т</size><size=30>еррористы</size></B>\nзакладка бомбы от just_qstn</i>", rgb(210, 150, 70));
    Teams.Add("ct", "<i><B><size=38>С</size><size=30>пецназ</size></B>\nзакладка бомбы от just_qstn</i>", rgb(70, 145, 210));
    let t_team = Teams.Get("t"), ct_team = Teams.Get("ct");
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

    Ui.GetContext().TeamProp1.Value = { Team: "t", Prop: "wins" };
    Ui.GetContext().TeamProp2.Value = { Team: "ct", Prop: "wins" };

    Ui.GetContext().MainTimerId.Value = main_timer.Id;

    // События
    Teams.OnRequestJoinTeam.Add(function (p, t) {
        p.Properties.Scores.Value = DEFAULT_MONEY;
        p.Properties.Get("bomb").Value = false;
        p.Properties.Get("defkit").Value = false;
        t.Add(p);
    });

    Teams.OnPlayerChangeTeam.Add(function (p) {
        if (state.Value == "round" || state.Value == "end_round") {
            p.Spawns.Spawn();
            p.Spawns.Despawn();
            p.Ui.Hint.Value = "Игра уже началась. Ждите конца игры";
            p.Timers.Get("clear_hint").Restart(10);
        } else p.Spawns.Spawn();
    });

    Players.OnPlayerDisconnected.Add(function () {
        if (state.Value != "round") return;
        if (t_team.GetAlivePlayersCount() <= 0) EndRound(ct_team);
        if (ct_team.GetAlivePlayersCount() <= 0) EndRound(t_team);
    });

    Damage.OnDeath.Add(function (p) {
        p.Properties.Deaths.Value++;
        if (state.Value != "warmup") {
            p.Properties.Get("defkit").Value = false;
            p.Properties.Get("bomb").Value = false;

            p.Inventory.Main.Value = false;
            p.Inventory.Secondary.Value = false;
            p.Inventory.Explosive.Value = false;
            p.contextedProperties.MaxHp.Value = 100;
        }
    });

    Damage.OnKill.Add(function (p, _k) {
        if (_k.Team != null && _k.Team != p.Team) {
            ++p.Properties.Kills.Value;
            p.Properties.Scores.Value += BOUNTY_KILL;
        }
    });

    Properties.OnPlayerProperty.Add(function (c, v) {
        if (v.Name == "Deaths" && !is_planted.Value && c.Player.Team.GetAlivePlayersCount() <= 0) EndRound(AnotherTeam(context.Player.Team));
        if (c.Player.Team == ct_team && v.Name == "Deaths" && is_planted.Value && c.Player.Team.GetAlivePlayersCount() <= 0) EndRound(t_team);
        if (c.Player.Properties.Scores.Value >= MAX_MONEY + 1) c.Player.Properties.Scores.Value = MAX_MONEY;
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
    
    main_wp_trigger.OnExit.Add(function(p) { p.Ui.Hint.Reset(); });

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

    secondary_wp_trigger.OnExit.Add(function(p) { p.Ui.Hint.Reset(); });

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

    explosive_wp_trigger.OnExit.Add(function(p) { p.Ui.Hint.Reset(); });

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

    defkit_trigger.OnExit.Add(function(p) { p.Ui.Hint.Reset(); });

    helmet_trigger.OnEnter.Add(function (p, a) {
        if (state.Value != "waiting") return;
        let prop = p.Properties.Get(a.Name + "_accept");
        if (p.contextedProperties.MaxHp.Value >= HELMET_HP) return p.Ui.Hint.Value = "Шлем уже куплен";
        if (prop.Value) {
            if (p.Properties.Scores.Value >= HELMET_COST) {
                p.Properties.Scores.Value -= HELMET_COST;
                p.Ui.Hint.Value = "Вы купили шлем";
                p.contextedProperties.MaxHp.Value = HELMET_HP;
            } else {
                p.Ui.Hint.Value = "Недостаточно денег. Нужно еще " + (HELMET_COST - p.Properties.Scores.Value);
            }
            return prop.Value = false;
        } else {
            p.Ui.Hint.Value = "Вы хотите купить шлем (+" + HELMET_HP + ") за " + HELMET_COST + ".\nВойдите в зону второй раз чтобы купить";
            return prop.Value = true;
        }
    });

    helmet_trigger.OnExit.Add(function(p) { p.Ui.Hint.Reset(); });

    vest_trigger.OnEnter.Add(function (p, a) {
        if (state.Value != "waiting") return;
        let prop = p.Properties.Get(a.Name + "_accept");
        if (p.contextedProperties.MaxHp.Value >= VEST_HP) return p.Ui.Hint.Value = "Бронежилет и шлем уже куплены";
        if (prop.Value) {
            if (p.Properties.Scores.Value >= VEST_COST) {
                p.Properties.Scores.Value -= VEST_COST;
                p.Ui.Hint.Value = "Вы купили бронежилет и шлем";
                p.contextedProperties.MaxHp.Value = VEST_HP;
            } else {
                p.Ui.Hint.Value = "Недостаточно денег. Нужно еще " + (VEST_COST - p.Properties.Scores.Value);
            }
            return prop.Value = false;
        } else {
            p.Ui.Hint.Value = "Вы хотите купить бронежилет и шлем (+" + VEST_HP + ") за " + VEST_COST + ".\nВойдите в зону второй раз чтобы купить";
            return prop.Value = true;
        }
    });

    vest_trigger.OnExit.Add(function(p) { p.Ui.Hint.Reset(); });

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

    bomb_trigger.OnExit.Add(function(p) { p.Ui.Hint.Reset(); });

    plant_trigger.OnEnter.Add(function (p, a) {
        if (!is_planted.Value && p.Team == t_team) {
            if (state.Value != "round") return p.Ui.Hint.Value = "Место закладки бомбы";
            if (!p.Properties.Get("bomb").Value) return p.Ui.Hint.Value = "У вас нет бомбы.";
            p.Ui.Hint.Value = "Ждите " + BOMB_PLANTING_TIME + "сек. в зоне чтобы заложить бомбу";
            p.Timers.Get("plant" + a.Name).Restart(BOMB_PLANTING_TIME);
        }
    });

    plant_trigger.OnExit.Add(function (p, a) {
        if (p.Team == t_team) {
            p.Ui.Hint.Reset();
            p.Timers.Get("plant" + a.Name).Stop();
        }
    });

    defuse_trigger.OnEnter.Add(function (p, a) {
        if (p.Team == ct_team) {
            let def_time = p.Properties.Get("defkit").Value ? BOMB_DEFUSEKIT_TIME : BOMB_DEFUSE_TIME;
            p.Ui.Hint.Value = "Ждите " + def_time + "сек. чтобы разминировать бомбу";
            p.Timers.Get("defuse" + a.Name).Restart(def_time);
        }
    });

    defuse_trigger.OnExit.Add(function (p, a) {
        if (p.Team == ct_team) {
            p.Ui.Hint.Reset();
            p.Timers.Get("defuse" + a.Name).Stop();
        }
    });

    // Таймеры
    Timers.OnPlayerTimer.Add(function (timer) {
        try {
            if (timer.Id.slice(0, 5) == "plant") {
                const area = AreaService.Get(timer.Id.replace("plant", ""));
                if (area.Tags.Contains("defuse") || is_planted.Value || state.Value != "round") return;
                Ui.GetContext().Hint.Value = "Бомба заложена. Спецназ должен разминировать красную зону.";
                is_planted.Value = true;
                main_timer.Restart(BEFORE_PLANTING_TIME);
                timer.Player.Properties.Scores.Value += BOUNTY_PLANT;
                timer.Player.Properties.Get("bomb").Value = false;
                area.Tags.Remove("_plant");
                area.Tags.Add("defuse");
            }
            if (timer.Id.slice(0, 6) == "defuse") {
                const area = AreaService.Get(timer.Id.replace("defuse", ""));
                if (area.Tags.Contains("_plant") || state.Value != "round") return;
                is_planted.Value = false;
                timer.Player.Properties.Scores.Value += BOUNTY_DEFUSE;
                area.Tags.Remove("defuse");
                area.Tags.Add("_plant");
                EndRound(ct_team);
            }
        } catch(e) { msg.Show(e.name + " " + e.message); }
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
                break
            case "end_round":
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

    function AddBombToRandom() {
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
        var e = Teams.GetEnumerator();
        while (e.moveNext()) {
            Spawns.GetContext(e.Current).Spawn();
        }
    }

    StartGame();
    function StartGame() {
        Spawns.GetContext().RespawnEnable = false;
        Ui.GetContext().Hint.Value = "Загрузка режима";
        AreasEnable(false);
        main_timer.Restart(LOADING_TIME);
        InitAreas();
    }

    function StartWarmup() {
        state.Value = "warmup";
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
        Spawns.GetContext().RespawnEnable = true;
        SpawnTeams();
        Ui.GetContext().Hint.Value = "Разминка";
        main_timer.Restart(WARMUP_TIME);
    }

    function WaitingRound() {
        //if (Players.Count == 1 || !GameMode.Parameters.GetBool("TestMode")) return main_timer.Restart(WARMUP_TIME);
        MapEditor.SetBlock(AreaService.Get("bd"), 93);
        MapEditor.SetBlock(AreaService.Get("bd"), 93);
        TeamsBalancer.IsAutoBalance = true;
        Damage.GetContext().DamageIn.Value = false;
        state.Value = "waiting";
        SpawnTeams();
        Ui.GetContext().Hint.Value = "Покупайте оружиe";
        main_timer.Restart(PRE_ROUND_TIME);
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
        state.Value = "round";
        Spawns.GetContext().RespawnEnable = false;
        Ui.GetContext().Hint.Value = "Закладка бомбы";
        main_timer.Restart(ROUND_TIME);
        MapEditor.SetBlock(AreaService.Get("bd"), 0);
        MapEditor.SetBlock(AreaService.Get("bd"), 0);
    }

    function EndRound(t) {
        try {
            Damage.GetContext().DamageIn.Value = false;
            Properties.GetContext().Get("addedBomb").Value = false;
            state.Value = "end_round";
            is_planted.Value = false;
            main_timer.Restart(AFTER_ROUND_TIME);
            round.Value++;
            var aTeam = AnotherTeam(t);

            Ui.GetContext().Hint.Value = t == ct_team ? "Победил спецназ" : "Победили террористы";
            var e = Players.GetEnumerator();
            while (e.moveNext()) {
                Properties.GetContext(e.Current).Scores.Value += e.Current.Team == t ? BOUNTY_WIN : BOUNTY_LOSE + (BOUNTY_LOSE_BONUS * aTeam.Properties.Get("loses").Value);
            }
            t.Properties.Get("wins").Value++;
            t.Properties.Get("loses").Value = Math.round(t.Properties.Get("loses").Value / 2);
            if (t.Properties.Get("loses").Value < 1) t.Properties.Get("loses").Value = 0;
            aTeam.Properties.Get("loses").Value++;

            if (round.Value >= ROUNDS + 1) EndGame();
        } catch (e) { msg.Show(e.name + " " + e.message); }
    }

    function EndGame() {
        const winner = ct_team.Properties.Get("wins").Value > t_team.Properties.Get("wins").Value ? ct_team : t_team;
        Game.GameOver(winner);
        state.Value = "end_game";
        main_timer.Restart(END_TIME);
    }
} catch (e) { Validate.ReportInvalid(e.name + " " + e.message); }
