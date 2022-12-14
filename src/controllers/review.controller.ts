import { JoinRepository } from "../repositories/join.repository";
import { ReviewRepository } from "../repositories/review.repository";
import { ReviewService } from "../services/review.service";
import { BusinessLogic } from "../shared/BusinessLogicInterface";

export class ReviewController { 
    private reviewService: ReviewService = new ReviewService(
        ReviewRepository.getQueryRepository(),
        JoinRepository.getQueryRepository()
    );

    public createReview: BusinessLogic = async(req, res, next) => {
        const review = req.body.review;
        const challengeId = Number(req.params.challenge_id);
        const user = req.decoded;
        
        const response = await this.reviewService.createReview(challengeId, review, user);
        
        return res.status(202).json(response);
    }


}