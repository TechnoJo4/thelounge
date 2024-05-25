import {PluginInputHandler} from "./index";
import Msg from "../../models/msg";
import {MessageType} from "../../../shared/types/msg";
import {ChanType} from "../../../shared/types/chan";

const commands = ["setkey"];

const input: PluginInputHandler = function (network, chan, cmd, args) {
	if (chan.type !== ChanType.CHANNEL && chan.type !== ChanType.QUERY) {
		chan.pushMessage(
			this,
			new Msg({
				type: MessageType.ERROR,
				text: `${cmd} command can only be used in channels and queries.`,
			})
		);

		return;
	}

	if (args.length === 0) {
		chan.pushMessage(
			this,
			new Msg({
				type: MessageType.ERROR,
				text: `Usage: /setkey <key>`,
			})
		);
		return;
	}

	const password = args.join(" ");
	network.keys[chan.name] = password;
	this.save();

	chan.pushMessage(
		this,
		new Msg({
			type: MessageType.NOTICE,
			text: `Key for ${chan.name} has been set to "${password}".`,
		})
	);

	return true;
};

export default {
	commands,
	input,
};
