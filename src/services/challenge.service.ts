import { ChallengeRepository } from '../repositories/challenge.repository';
import { User } from '../entity/user';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../shared/exception';
import { ChallengeInfo } from '../shared/DataTransferObject';
import { JoinRepository } from '../repositories/join.repository';

export class ChallengeService {
	constructor(
		private challengeRepository: ChallengeRepository,
		private joinRepository: JoinRepository,
	) {}

	async createChallenge(challengeInfo: ChallengeInfo, user: User) {
		const alreadyChallenge = await this.challengeRepository.findByName(challengeInfo.name);
    const period = await this.getDateDiff(challengeInfo.startDay, challengeInfo.endDay);

		if (!alreadyChallenge) {
			if (challengeInfo.limitMember < 5 || challengeInfo.limitMember > 30)
				throw new BadRequestError(`Error limitMember`);

      if(period > 30 || period < 7)
        throw new BadRequestError(`Error Date`);
  
      const newChallenge = await this.challengeRepository.createChallenge(challengeInfo, user);
      return this.joinRepository.JoinChallenge(newChallenge.id, user);
		}
    throw new ConflictError();
	}

	async searchChallenge(searchWord: string) {
		return this.challengeRepository.searchChallenge(searchWord);
	}

	async joinChallenge(challengeId: number, user: User) {
		const challenge = await this.challengeRepository.getOneChallenge(challengeId);
		if (challenge) {
			if (!(await this.joinRepository.checkChallenge(challengeId, user))) {
				this.joinRepository.JoinChallenge(challengeId, user);
			} else throw new ConflictError();
		} else throw new NotFoundError();
	}

	async getOneChallenge(challengeId: number) {
		const challenge = await this.challengeRepository.getOneChallenge(challengeId);

		if (challenge) return challenge;
		throw new NotFoundError();
	}

	async getAllChallenge() {
		return this.challengeRepository.getAllChallenge();
	}

	async getChallengeMember(challengeId: number, user: User) {
		const challenge = await this.challengeRepository.getOneChallenge(challengeId);
		const check = await this.joinRepository.checkChallenge(challengeId, user);

		if (challenge) {
			if (check) return this.joinRepository.getChallengeMember(challengeId);
			throw new ForbiddenError();
		}
		throw new NotFoundError();
	}

	async getMyChallenge(user: User) {
		return this.joinRepository.getMyChallenge(user);
	}

  async getDateDiff(startDay: Date, endDay: Date) {
    const StartDay = new Date(startDay);
    const EndDay = new Date(endDay);
  
    const diffDate = StartDay.getTime() - EndDay.getTime();
    
    return Math.abs(diffDate / (1000 * 60 * 60 * 24));
  }
}
